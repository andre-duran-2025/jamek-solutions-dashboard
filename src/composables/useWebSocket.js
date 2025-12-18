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
const isGatewayOnline = ref(false) // New global gateway status
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
        // Backend fields mapping
        rodando: false,       // Matches 'rodando'
        online: false,        // Matches 'online'
        frequencia: 0,        // Matches 'frequencia'
        frequencia_setpoint: 0, // Matches 'frequencia_setpoint'
        corrente: 0,          // Matches 'corrente'
        direcao: 'frente',    // Matches 'direcao'
        ultima_atualizacao: 0, // Matches 'ultima_atualizacao'
        
        // Frontend specific
        stats: { cmd: 0, read: 0, err: 0 },
        systemState: 'Aguardando...',
        lastMessageTime: 0
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
    // Determine host: prefer config, fallback to window.location.host
    let host = serverConfig.host
    
    // If config is missing or localhost (development default)
    if (!host || host === 'localhost') {
       // If running on production dashboard, use production API
       if (window.location.hostname === 'painel.jamek.com.br') {
         host = 'api.jamek.com.br'
       } else {
         // Otherwise try current host (self-hosted) or default to api
         host = window.location.host || 'api.jamek.com.br'
       }
    }
    
    // Auto-detect protocol based on current page if not explicitly set, 
    // but prioritize config if it matches the security context
    const isSecure = window.location.protocol === 'https:'
    let protocol = serverConfig.useSSL ? 'wss://' : 'ws://'
    
    // Force WSS if page is loaded via HTTPS to avoid Mixed Content errors
    if (isSecure && protocol === 'ws://') {
      console.warn("Forcing WSS because page is loaded via HTTPS")
      protocol = 'wss://'
    }

    // Clean host from any protocol prefix
    const cleanHost = host.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '')
    return `${protocol}${cleanHost}/api/ws/inversor`
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
    // Handle array of messages (if batching is used)
    if (Array.isArray(data)) {
      data.forEach(item => handleMessage(item))
      return
    }

    // 1. Handle Error Messages
    if (data.tipo === 'erro') {
      const id = data.inversor || activeInverterId.value
      const state = ensureInverterState(id)
      state.stats.err++
      
      if (id === activeInverterId.value) {
        showAlert(`Erro Inv${id}: ${data.mensagem}`, "error")
        addLog(`ERRO Inv${id}: ${data.mensagem}`, "error")
      }
      return
    }

    // 2. Handle Alerts
    if (data.tipo === 'alerta') {
      const severity = data.severidade === 'critico' ? 'error' : 'warning'
      showAlert(data.mensagem, severity)
      addLog(`ALERTA: ${data.mensagem}`, severity)
      return
    }

    // 3. Handle Gateway Status
    if (data.tipo === 'gateway_status') {
      // Global system state
      const isOnline = data.online
      isGatewayOnline.value = isOnline // Update global gateway status
      
      // Update active inverter system state
      const activeState = currentState.value
      activeState.systemState = isOnline ? "Gateway Online" : "Gateway Offline"
      
      if (data.uptime) activeState.uptime = data.uptime
      
      if (!isOnline) {
        showAlert("Gateway ESP32 Offline", "error")
      } else {
        // If we were showing offline alert, hide it
        if (alertMessage.value.includes("Offline")) hideAlert()
      }
      return
    }

    // 4. Handle Gateway Stats
    if (data.tipo === 'gateway_stats') {
      const activeState = currentState.value
      if (data.cmd !== undefined) activeState.stats.cmd = data.cmd
      if (data.read !== undefined) activeState.stats.read = data.read
      if (data.err !== undefined) activeState.stats.err = data.err
      return
    }

    // 5. Handle Inverter Status Update (Default case)
    // Check if it has 'inv' or 'id' field
    const id = data.inv || data.id
    if (id) {
      // Implicitly mark gateway as online if we receive inverter data
      isGatewayOnline.value = true
      
      const state = ensureInverterState(id)
      state.lastMessageTime = Date.now()
      updateLastUpdate(id)

      // Map backend fields to state
      if (data.online !== undefined) {
        const isOnline = data.online === true || data.online === "1" || data.online === 1
        state.isESP32Online = isOnline
        state.online = isOnline // Keep raw field too
        
        if (!isOnline) {
          state.isRunning = false
          if (id === activeInverterId.value) {
            state.systemState = "Inversor Offline"
          }
        } else {
          if (id === activeInverterId.value) {
            state.systemState = "Inversor Online"
          }
        }
      }

      if (data.rodando !== undefined) {
        const isRunning = data.rodando === true || data.rodando === "1" || data.rodando === 1
        const wasRunning = state.isRunning
        state.isRunning = isRunning
        state.rodando = isRunning // Keep raw field
        
        if (isRunning !== wasRunning && state.isESP32Online && id === activeInverterId.value) {
          addLog(isRunning ? `Inversor ${id} LIGADO` : `Inversor ${id} DESLIGADO`, "info")
        }
      }

      if (data.frequencia !== undefined) {
        state.currentFreq = Number(data.frequencia)
        state.frequencia = state.currentFreq
      }

      if (data.frequencia_setpoint !== undefined) {
        state.setpointFreq = Number(data.frequencia_setpoint)
        state.frequencia_setpoint = state.setpointFreq
      }

      if (data.corrente !== undefined) {
        state.corrente = Number(data.corrente)
      }

      if (data.direcao !== undefined) {
        const dir = String(data.direcao).toLowerCase()
        state.direction = dir === "frente" ? "Frente" : "Reverso"
        state.direcao = dir
      }
      
      return
    }

    // Legacy/Fallback: Topic based handling (if needed)
    if (data.topic) {
      // ... keep existing logic if strictly necessary, but Node-RED seems to send objects now
      // We can leave a minimal fallback or remove it. 
      // Given the Node-RED flow, the above object handling should cover it.
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
    
    const state = ensureInverterState(activeInverterId.value) // Ensure state exists
    
    // Optimistic Update: Update UI immediately
    if (cmd === 'start') {
      state.isRunning = true
      state.rodando = true
      state.systemState = "Inversor Online"
    } else if (cmd === 'stop') {
      state.isRunning = false
      state.rodando = false
      state.systemState = "Inversor Parado"
    } else if (cmd === 'direcao') {
      const newDir = state.direcao === 'frente' ? 'tras' : 'frente'
      state.direcao = newDir
      state.direction = newDir === 'frente' ? 'Frente' : 'Reverso'
    } else if (cmd === 'freq' && value !== null) {
      state.setpointFreq = Number(value)
      state.frequencia_setpoint = Number(value)
      // We don't update currentFreq yet, waiting for feedback
    }

    // Include ID in the message for backend routing
    // Node-RED expects 'inv', 'cmd', 'value'
    const message = {
      cmd,
      inv: activeInverterId.value,
      ...(value !== null ? { value } : {})
    }
    
    try {
      ws.value.send(JSON.stringify(message))
      return true
    } catch (error) {
      console.error("Erro ao enviar:", error)
      // Revert optimistic update if needed? 
      // For now, next heartbeat will fix it, or user tries again.
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
    isGatewayOnline,
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
