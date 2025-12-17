import { ref, computed } from 'vue'
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

// State
const ws = ref(null)
const isConnected = ref(false)
const isESP32Online = ref(false)
const isRunning = ref(false)
const reconnectAttempts = ref(0)
const logs = ref([])
const alertMessage = ref('')
const alertType = ref('error')
const showAlertBanner = ref(false)

// Data
const currentFreq = ref(0)
const setpointFreq = ref(0)
const direction = ref('--')
const uptime = ref(0)
const stats = ref({
  cmd: 0,
  read: 0,
  err: 0
})
const lastUpdate = ref('--:--:--')
const systemState = ref('Aguardando...')

// Timers
let reconnectTimer = null
let pingTimer = null
let watchdogTimer = null
let lastMessageTime = 0
let lastHeartbeatTime = 0
let currentReconnectInterval = CONFIG.reconnectInterval

export function useWebSocket() {
  
  const getWebSocketUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
    return `${protocol}api.jamek.com.br/api/ws/inversor`
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

  const updateLastUpdate = () => {
    const now = new Date()
    lastUpdate.value = now.toLocaleTimeString('pt-BR', { 
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
      const timeSince = Date.now() - lastMessageTime
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
    updateLastUpdate()
    
    if (data.topic === "server/heartbeat") {
      lastHeartbeatTime = Date.now()
      return
    }
    
    // console.log("📨", data.topic, "=", data.value)
    
    if (data.topic === "inversor/status/rodando") {
      const running = data.value == "1" || data.value == 1
      if (running !== isRunning.value && isESP32Online.value) {
        addLog(running ? "Inversor LIGADO" : "Inversor DESLIGADO", "info")
      }
      isRunning.value = running
    }
    
    if (data.topic === "inversor/status/frequencia") {
      currentFreq.value = Number(data.value)
    }
    
    if (data.topic === "inversor/status/frequencia_setpoint") {
      setpointFreq.value = Number(data.value)
    }
    
    if (data.topic === "inversor/status/uptime") {
      uptime.value = Number(data.value)
    }
    
    if (data.topic === "inversor/status/direcao") {
      const dir = String(data.value).toLowerCase()
      direction.value = dir === "frente" ? "Frente" : "Reverso"
    }
    
    if (data.topic === "inversor/status/online") {
      const isOnline = data.value == "1" || data.value == 1
      isESP32Online.value = isOnline
      
      if (!isOnline) {
        isRunning.value = false
        systemState.value = "ESP32 Offline"
        showAlert("ESP32 OFFLINE", "error")
        addLog("ESP32 OFFLINE", "error")
      } else {
        systemState.value = "ESP32 Online"
        hideAlert()
        addLog("ESP32 ONLINE", "success")
      }
    }
    
    if (data.topic === "inversor/status/erro") {
      showAlert(`Erro: ${data.value}`, "error")
      addLog(`ERRO: ${data.value}`, "error")
      stats.value.err++
    }
    
    if (data.topic === "inversor/status/stats") {
      try {
        const statsData = typeof data.value === 'string' ? JSON.parse(data.value) : data.value
        
        if (statsData.cmd !== undefined) stats.value.cmd = statsData.cmd
        if (statsData.read !== undefined) stats.value.read = statsData.read
        if (statsData.err !== undefined) stats.value.err = statsData.err
        
        if (isESP32Online.value) {
          systemState.value = stats.value.read > 10 ? "Estável" : "Transitório"
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
        isESP32Online.value = false
        isRunning.value = false
        
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
          lastMessageTime = Date.now()
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
    
    if (!isESP32Online.value && cmd !== 'ping') {
      addLog("Erro: ESP32 offline", "error")
      showToast("ESP32 não está respondendo", "warning")
      return false
    }
    
    const message = value !== null ? { cmd, value } : { cmd }
    
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
    if (lastHeartbeatTime > 0) {
      const age = Date.now() - lastHeartbeatTime
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
