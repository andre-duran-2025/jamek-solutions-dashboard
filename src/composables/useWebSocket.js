import { ref, computed, reactive } from 'vue'
import { useConfig } from './useConfig'
import { useToast } from './useToast'

const { serverConfig } = useConfig()
const { showToast } = useToast()

// Constants
const CONFIG = {
  reconnectInterval: 3000,
  maxReconnectInterval: 30000,
  reconnectBackoff: 1.5,
  pingInterval: 30000,
  watchdogTimeout: 20000,
  heartbeatMaxAge: 45000
}

// State Global
const ws = ref(null)
const isConnected = ref(false)
const reconnectAttempts = ref(0)
const logs = ref([])
const alertMessage = ref('')
const alertType = ref('error')
const showAlertBanner = ref(false)

// Active Inverter Selection
const activeInverterId = ref(1) // Default to 1

// Per-Inverter State
// Structure: { [id]: { isRunning, isESP32Online, currentFreq, ... } }
const inverterStates = reactive({})

// Initialize state for an inverter
const ensureInverterState = (id) => {
  if (!inverterStates[id]) {
    inverterStates[id] = {
      isRunning: false,
      isESP32Online: false,
      currentFreq: 0,
      setpointFreq: 0,
      direction: '--',
      uptime: 0,
      stats: { cmd: 0, read: 0, err: 0 },
      lastUpdate: '--:--:--',
      systemState: 'Aguardando...',
      lastMessageTime: 0,
      lastHeartbeatTime: 0
    }
  }
  return inverterStates[id]
}

// Initialize for ID 1 by default
ensureInverterState(1)

// Computed helpers for the active inverter
const currentState = computed(() => ensureInverterState(activeInverterId.value))

const isRunning = computed({
  get: () => currentState.value.isRunning,
  set: (v) => currentState.value.isRunning = v
})
const isESP32Online = computed({
  get: () => currentState.value.isESP32Online,
  set: (v) => currentState.value.isESP32Online = v
})
const currentFreq = computed({
  get: () => currentState.value.currentFreq,
  set: (v) => currentState.value.currentFreq = v
})
const setpointFreq = computed({
  get: () => currentState.value.setpointFreq,
  set: (v) => currentState.value.setpointFreq = v
})
const direction = computed({
  get: () => currentState.value.direction,
  set: (v) => currentState.value.direction = v
})
const uptime = computed({
  get: () => currentState.value.uptime,
  set: (v) => currentState.value.uptime = v
})
const stats = computed(() => currentState.value.stats)
const lastUpdate = computed({
  get: () => currentState.value.lastUpdate,
  set: (v) => currentState.value.lastUpdate = v
})
const systemState = computed({
  get: () => currentState.value.systemState,
  set: (v) => currentState.value.systemState = v
})

// Timers
let reconnectTimer = null
let pingTimer = null
let watchdogTimer = null
let currentReconnectInterval = CONFIG.reconnectInterval

export function useWebSocket() {
  
  const getWebSocketUrl = () => {
    return "wss://api.jamek.com.br/api/ws/inversor"
  }

  const setActiveInverter = (id) => {
    activeInverterId.value = Number(id)
    ensureInverterState(activeInverterId.value)
  }

  const addLog = (message, type = 'info') => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
    
    logs.value.push({
      time: timeStr,
      message,
      type
    })
    
    if (logs.value.length > 100) {
      logs.value.shift()
    }
  }

  const showAlert = (message, type = "error") => {
    alertMessage.value = message
    alertType.value = type
    showAlertBanner.value = true
    
    if (type === "warning") {
      setTimeout(() => {
        showAlertBanner.value = false
      }, 10000)
    }
  }

  const hideAlert = () => {
    showAlertBanner.value = false
  }

  const updateLastUpdate = (id) => {
    const now = new Date()
    const state = ensureInverterState(id)
    state.lastUpdate = now.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const formattedUptime = computed(() => formatUptime(uptime.value))

  const startPingPong = () => {
    stopPingPong()
    pingTimer = setInterval(() => {
      if (ws.value && ws.value.readyState === WebSocket.OPEN) {
        try {
          ws.value.send(JSON.stringify({ cmd: 'ping', timestamp: Date.now() }))
        } catch (e) {
          console.error("Erro ao enviar ping:", e)
        }
      }
    }, CONFIG.pingInterval)
  }

  const stopPingPong = () => {
    if (pingTimer) {
      clearInterval(pingTimer)
      pingTimer = null
    }
  }

  const startWatchdog = () => {
    stopWatchdog()
    watchdogTimer = setTimeout(() => {
      // Check active inverter only for alerts
      const activeState = currentState.value
      const timeSince = Date.now() - activeState.lastMessageTime
      if (timeSince > CONFIG.watchdogTimeout) {
        console.warn("⚠️ Watchdog: Sem dados há muito tempo")
        addLog("Sem dados - verificando conexão", "warning")
        showAlert("Sem atualizações do servidor", "warning")
      }
    }, CONFIG.watchdogTimeout)
  }

  const resetWatchdog = () => {
    startWatchdog()
  }

  const stopWatchdog = () => {
    if (watchdogTimer) {
      clearTimeout(watchdogTimer)
      watchdogTimer = null
    }
  }

  const handleMessage = (data) => {
    // Extract ID from topic or default to 1
    // Expected patterns:
    // inversor/status/... -> ID 1
    // inversor/5/status/... -> ID 5
    
    let id = 1
    let topicPath = data.topic
    
    const parts = data.topic.split('/')
    if (parts[0] === 'inversor' && !isNaN(parts[1])) {
      id = Number(parts[1])
      // Reconstruct topic path without ID to normalize handling
      // inversor/5/status/rodando -> inversor/status/rodando
      topicPath = `inversor/${parts.slice(2).join('/')}`
    }

    const state = ensureInverterState(id)
    state.lastMessageTime = Date.now()
    updateLastUpdate(id)
    
    if (topicPath === "server/heartbeat") {
      state.lastHeartbeatTime = Date.now()
      return
    }
    
    if (topicPath === "inversor/status/rodando") {
      const running = data.value == "1" || data.value == 1
      if (running !== state.isRunning && state.isESP32Online && id === activeInverterId.value) {
        addLog(running ? "Inversor LIGADO" : "Inversor DESLIGADO", "info")
      }
      state.isRunning = running
    }
    
    if (topicPath === "inversor/status/frequencia") {
      state.currentFreq = Number(data.value)
    }
    
    if (topicPath === "inversor/status/frequencia_setpoint") {
      state.setpointFreq = Number(data.value)
    }
    
    if (topicPath === "inversor/status/uptime") {
      state.uptime = Number(data.value)
    }
    
    if (topicPath === "inversor/status/direcao") {
      const dir = String(data.value).toLowerCase()
      state.direction = dir === "frente" ? "Frente" : "Reverso"
    }
    
    if (topicPath === "inversor/status/online") {
      const isOnline = data.value == "1" || data.value == 1
      state.isESP32Online = isOnline
      
      if (!isOnline) {
        state.isRunning = false
        state.systemState = "ESP32 Offline"
        if (id === activeInverterId.value) {
          showAlert("ESP32 OFFLINE", "error")
          addLog("ESP32 OFFLINE", "error")
        }
      } else {
        state.systemState = "ESP32 Online"
        if (id === activeInverterId.value) {
          hideAlert()
          addLog("ESP32 ONLINE", "success")
        }
      }
    }
    
    if (topicPath === "inversor/status/erro") {
      if (id === activeInverterId.value) {
        showAlert(`Erro: ${data.value}`, "error")
        addLog(`ERRO: ${data.value}`, "error")
      }
      state.stats.err++
    }
    
    if (topicPath === "inversor/status/stats") {
      try {
        const statsData = typeof data.value === 'string' ? JSON.parse(data.value) : data.value
        
        if (statsData.cmd !== undefined) state.stats.cmd = statsData.cmd
        if (statsData.read !== undefined) state.stats.read = statsData.read
        if (statsData.err !== undefined) state.stats.err = statsData.err
        
        if (state.isESP32Online) {
          state.systemState = state.stats.read > 10 ? "Estável" : "Transitório"
        }
      } catch (e) {
        console.error("Erro ao processar stats:", e)
      }
    }
  }

  const connect = () => {
    if (ws.value && (ws.value.readyState === WebSocket.CONNECTING || ws.value.readyState === WebSocket.OPEN)) {
      return
    }
    
    const wsUrl = getWebSocketUrl()
    console.log(`🔌 Conectando: ${wsUrl}`)
    addLog(`Conectando... (tentativa ${reconnectAttempts.value + 1})`, "info")
    
    try {
      ws.value = new WebSocket(wsUrl)
      
      ws.value.onopen = () => {
        console.log("✅ WebSocket conectado!")
        reconnectAttempts.value = 0
        currentReconnectInterval = CONFIG.reconnectInterval
        isConnected.value = true
        addLog("Conectado ao Node-RED!", "success")
        hideAlert()
        
        if (reconnectTimer) {
          clearTimeout(reconnectTimer)
          reconnectTimer = null
        }
        
        startPingPong()
        startWatchdog()
      }
      
      ws.value.onclose = (event) => {
        console.log("❌ WebSocket desconectado", event.code)
        ws.value = null
        isConnected.value = false
        
        // Mark all as offline? Or just global status
        // We'll keep per-inverter state as is but maybe mark them as possibly stale?
        
        stopPingPong()
        stopWatchdog()
        
        if (event.wasClean) {
          addLog("Conexão fechada", "warning")
        } else {
          addLog("Conexão perdida - reconectando...", "error")
          showAlert("Conexão perdida - tentando reconectar...", "error")
        }
        
        scheduleReconnect()
      }
      
      ws.value.onerror = (error) => {
        console.error("❌ Erro WebSocket:", error)
        addLog("Erro de conexão", "error")
      }
      
      ws.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleMessage(data)
          resetWatchdog()
        } catch (error) {
          console.error("❌ Erro ao processar mensagem:", error)
        }
      }
      
    } catch (error) {
      console.error("❌ Erro ao criar WebSocket:", error)
      addLog("Erro ao conectar: " + error.message, "error")
      scheduleReconnect()
    }
  }

  const scheduleReconnect = () => {
    if (reconnectTimer) return
    
    reconnectAttempts.value++
    
    currentReconnectInterval = Math.min(
      CONFIG.reconnectInterval * Math.pow(CONFIG.reconnectBackoff, reconnectAttempts.value - 1),
      CONFIG.maxReconnectInterval
    )
    
    const seconds = Math.round(currentReconnectInterval / 1000)
    console.log(`🔄 Reconectando em ${seconds}s...`)
    addLog(`Próxima tentativa em ${seconds}s`, "warning")
    
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      connect()
    }, currentReconnectInterval)
  }

  const disconnect = () => {
    if (ws.value) {
      ws.value.close()
    }
  }

  const sendCommand = (cmd, value = null) => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      addLog("Erro: Desconectado", "error")
      showToast("Sem conexão com o servidor", "error")
      return false
    }
    
    const state = currentState.value
    if (!state.isESP32Online && cmd !== 'ping') {
      addLog("Erro: ESP32 offline", "error")
      showToast("ESP32 não está respondendo", "warning")
      return false
    }
    
    // Include ID in the message for backend routing
    const message = {
      cmd,
      id: activeInverterId.value,
      ...(value !== null ? { value } : {})
    }
    
    try {
      ws.value.send(JSON.stringify(message))
      return true
    } catch (error) {
      console.error("Erro ao enviar:", error)
      return false
    }
  }

  // Heartbeat check interval
  setInterval(() => {
    const state = currentState.value
    if (state.lastHeartbeatTime > 0) {
      const age = Date.now() - state.lastHeartbeatTime
      if (age > CONFIG.heartbeatMaxAge) {
        console.warn("⚠️ Heartbeat muito antigo")
        showAlert("ESP32 pode estar offline", "warning")
      }
    }
  }, 10000)

  return {
    connect,
    disconnect,
    sendCommand,
    setActiveInverter,
    activeInverterId,
    inverterStates,
    isConnected,
    isESP32Online,
    isRunning,
    reconnectAttempts,
    logs,
    alertMessage,
    alertType,
    showAlertBanner,
    currentFreq,
    setpointFreq,
    direction,
    formattedUptime,
    stats,
    lastUpdate,
    systemState
  }
}
