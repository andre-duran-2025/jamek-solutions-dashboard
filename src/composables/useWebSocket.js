import { ref, computed, reactive, onUnmounted } from 'vue'
import { useConfig } from './useConfig'
import { useToast } from './useToast'
import WebSocketClient from '@/services/WebSocketClient'

const { serverConfig } = useConfig()
const { showToast } = useToast()

// Constants
const CONFIG = {
  pingInterval: 30000,
  watchdogTimeout: 20000
}

// State Global
const wsClient = ref(null)
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
// Structure: { [id]: { isRunning, isDeviceOnline, currentFreq, ... } }
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
        latency: 0,            // New: Matches '_latency'
        
        // Frontend specific
        stats: { cmd: 0, read: 0, err: 0 },
        systemState: 'Aguardando...',
        lastMessageTime: 0,
        ignoreUpdatesUntil: 0 // New: ignore stale server updates after local commands
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
const isDeviceOnline = computed({
  get: () => currentState.value.isDeviceOnline,
  set: (v) => currentState.value.isDeviceOnline = v
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
const latency = computed(() => currentState.value.latency)
  const systemState = computed({
    get: () => currentState.value.systemState,
    set: (v) => currentState.value.systemState = v
  })

// Timers
let pingTimer = null
let watchdogTimer = null

export function useWebSocket() {
  
  const getWebSocketUrl = () => {
    // Use configured host and port
    const host = serverConfig.value.host || '192.168.2.24'
    const port = serverConfig.value.port || 1880
    
    // Always force WS:// for local IPs to avoid mixed content issues or SSL errors
    // unless explicitly configured otherwise via override
    let protocol = serverConfig.value.useSSL ? 'wss://' : 'ws://'
    
    // Clean host from any protocol prefix
    const cleanHost = host.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '')
    
    // Auto-downgrade to ws:// if using local IP, even if SSL is checked
    if (cleanHost.startsWith('192.168.') || cleanHost.startsWith('10.') || cleanHost.startsWith('localhost') || cleanHost.startsWith('127.')) {
        if (protocol === 'wss://') {
            console.warn("⚠️ Detectado IP local. Forçando protocolo ws:// para evitar erros de SSL.")
            protocol = 'ws://'
        }
    }

    // For standard HTTPS ports (443) or implicit SSL, we might want to omit the port if cleaner
    const portSuffix = (port === 443 || port === 80) ? '' : `:${port}`

    const path = serverConfig.value.path || '/api/ws/gateway'
    const url = `${protocol}${cleanHost}${portSuffix}${path}`
    console.log(`🔗 Gerando URL WebSocket: ${url} (SSL Configurado: ${serverConfig.value.useSSL}, Protocolo Final: ${protocol})`)
    return url
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

    // 3. Handle Gateway Status / Heartbeat
    if (data.tipo === 'gateway_status' || data.tipo === 'heartbeat') {
      // Global system state
      const isOnline = data.status === 'online' || data.online === true
      isGatewayOnline.value = isOnline // Update global gateway status
      
      // Update active inverter system state
      const activeState = currentState.value
      activeState.systemState = isOnline ? "Gateway Online" : "Gateway Offline"
      
      if (data.uptime) activeState.uptime = data.uptime
      
      // Handle extra fields from new flow
      if (data.gateway) console.log(`📡 Gateway: ${data.gateway} (${data.cliente})`)
      
      if (!isOnline) {
        showAlert("Sistema Offline", "error")
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

    // Handle Inverter Status Update (Dynamic Fields)
    // Check if it has 'inv' field (New Flow standard)
    const id = data.inv || data.id
    if (id) {
      // Implicitly mark gateway as online if we receive inverter data
      isGatewayOnline.value = true
      
      const state = ensureInverterState(id)
      state.lastMessageTime = Date.now()
      updateLastUpdate(id)

      // Update Latency if present
      if (data._latency !== undefined) {
        state.latency = data._latency
      }

      // Dynamic field mapping
      // The new flow sends: { inv: 1, [key]: value }
      Object.keys(data).forEach(key => {
        if (key === 'inv' || key === 'id' || key === '_latency') return

        const value = data[key]
        
        // Skip updates if we are in "ignore mode" for this inverter (debounce server echo)
        // BUT allow "online" status updates as they are critical
        if (state.ignoreUpdatesUntil > Date.now() && key !== 'online') {
            return
        }
        
        // Handle specific boolean/numeric conversions
        if (key === 'online') {
          const isOnline = value === true || value === "1" || value === 1
          state.isDeviceOnline = isOnline
          state.online = isOnline
          
          if (!isOnline) {
            state.isRunning = false
            if (id === activeInverterId.value) state.systemState = "Inversor Offline"
          } else {
            if (id === activeInverterId.value) state.systemState = "Inversor Online"
          }
        }
        else if (key === 'rodando') {
          const isRunning = value === true || value === "1" || value === 1
          const wasRunning = state.isRunning
          state.isRunning = isRunning
          state.rodando = isRunning
          
          if (isRunning !== wasRunning && state.isDeviceOnline && id === activeInverterId.value) {
            addLog(isRunning ? `Inversor ${id} LIGADO` : `Inversor ${id} DESLIGADO`, "info")
          }
        }
        else if (key === 'frequencia') {
          state.currentFreq = Number(value)
          state.frequencia = state.currentFreq
        }
        else if (key === 'frequencia_setpoint') {
          state.setpointFreq = Number(value)
          state.frequencia_setpoint = state.setpointFreq
        }
        else if (key === 'corrente') {
          state.corrente = Number(value)
        }
        else if (key === 'direcao') {
          const v = String(value).toLowerCase()
          // Handle various formats: 'frente'/'tras', '0'/'1', 'forward'/'reverse'
          if (v === 'frente' || v === 'forward' || v === '0') {
            state.direction = 'Frente'
            state.direcao = 'frente'
          } else {
            state.direction = 'Reverso'
            state.direcao = 'tras'
          }
        }
        else {
          // Generic fallback for other fields
          state[key] = value
        }
      })
      
      return
    }

    // Handle Gateway Heartbeat (Raw MQTT JSON or transformed)
    // If it has 'uptime' but NO 'inv', it's likely gateway stats
    if (data.uptime !== undefined && !data.inv) {
       isGatewayOnline.value = true
       const activeState = currentState.value
       activeState.uptime = data.uptime
       activeState.systemState = "Gateway Online"
       
       if (data.free_heap && data.free_heap < 50000) {
         // Low heap warning
       }
       return
    }
  }

  const connect = () => {
    // Prevent multiple connections
    if (wsClient.value && wsClient.value.isConnected) {
      return
    }

    const wsUrl = getWebSocketUrl()
    
    wsClient.value = new WebSocketClient(wsUrl, {
      autoReconnect: true,
      reconnectDelay: 2000,
      
      onConnected: () => {
        reconnectAttempts.value = 0
        isConnected.value = true
        addLog("Conectado ao Node-RED!", "success")
        hideAlert()
        startPingPong()
        startWatchdog()
      },
      
      onDisconnected: (event) => {
        isConnected.value = false
        stopPingPong()
        stopWatchdog()
        
        if (event.wasClean) {
          addLog("Conexão fechada", "warning")
        } else {
          addLog("Conexão perdida - reconectando...", "error")
          showAlert("Conexão perdida - tentando reconectar...", "error")
        }
      },
      
      onReconnecting: (attempt) => {
        reconnectAttempts.value = attempt
        addLog(`Reconectando... (tentativa ${attempt})`, "warning")
      },
      
      onError: (error) => {
        addLog("Erro de conexão", "error")
      },
      
      onMessage: (data) => {
        handleMessage(data)
        resetWatchdog()
      }
    })
    
    wsClient.value.connect()
  }

  const disconnect = () => {
    if (wsClient.value) {
      wsClient.value.disconnect()
    }
  }

  const sendCommand = (cmd, value = null) => {
    if (!wsClient.value || !wsClient.value.isConnected) {
      console.warn("⚠️ WebSocket não está pronto.")
      addLog("Erro: Desconectado.", "error")
      return false
    }

    // Check buffer size (direct access to underlying WS if needed, or via client method)
    // Assuming client handles basic sending. 
    // If we need buffer check, we might need to expose it in WebSocketClient or access wsClient.value.ws
    if (wsClient.value.ws && wsClient.value.ws.bufferedAmount > 10240) {
       console.warn("⚠️ Buffer cheio, comando descartado")
       addLog("Rede lenta - comando descartado", "warning")
       return false
    }
    
    const state = ensureInverterState(activeInverterId.value)
    
    // Optimistic Update
    if (cmd === 'start') {
      state.isRunning = true
      state.rodando = true
      state.systemState = "Inversor Online"
      state.ignoreUpdatesUntil = Date.now() + 1500 
    } else if (cmd === 'stop') {
      state.isRunning = false
      state.rodando = false
      state.systemState = "Inversor Parado"
      state.ignoreUpdatesUntil = Date.now() + 1500
    } else if (cmd === 'direcao') {
      const newDir = state.direcao === 'frente' ? 'tras' : 'frente'
      state.direcao = newDir
      state.direction = newDir === 'frente' ? 'Frente' : 'Reverso'
      state.ignoreUpdatesUntil = Date.now() + 1500
    } else if (cmd === 'freq' && value !== null) {
      state.setpointFreq = Number(value)
      state.frequencia_setpoint = Number(value)
    }

    let message = {}

    // Node-RED Flow Compatibility Adapter
    if (cmd === 'start') {
      message = { cmd: 'ligar' }
      // Optimistic
      state.isRunning = true
      state.systemState = "Enviando comando..."
    } 
    else if (cmd === 'stop') {
      message = { cmd: 'desligar' }
      // Optimistic
      state.isRunning = false
      state.systemState = "Enviando comando..."
    }
    else if (cmd === 'freq' && value !== null) {
      // Scale: 0-60Hz -> 0-600
      let speed = Math.round(Number(value) * 10)
      if (speed < 0) speed = 0
      if (speed > 600) speed = 600
      message = { speed: speed }
      
      state.setpointFreq = Number(value)
    }
    else {
      // Fallback for other commands
      message = {
        cmd,
        inv: activeInverterId.value,
        id: activeInverterId.value,
        inversor: activeInverterId.value,
        ...(value !== null ? { value } : {})
      }
    }
    
    console.log(`📤 Enviando comando para Inversor ${activeInverterId.value}:`, message)
    
    const sent = wsClient.value.send(message)
    if (!sent) {
      addLog("Falha ao enviar comando", "error")
    }
    return sent
  }

  // Heartbeat check interval
  setInterval(() => {
    // Aggressive ping to keep connection alive
    if (wsClient.value && wsClient.value.isConnected) {
       wsClient.value.send({ cmd: 'ping', timestamp: Date.now() })
    }
  }, 5000)

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })


  return {
    connect,
    disconnect,
    sendCommand,
    setActiveInverter,
    activeInverterId,
    inverterStates,
    isConnected,
    isGatewayOnline,
    isDeviceOnline,
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
