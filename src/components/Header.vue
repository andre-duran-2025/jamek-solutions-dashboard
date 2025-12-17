<script setup>
import { useWebSocket } from '@/composables/useWebSocket'

const { isConnected, isESP32Online, reconnectAttempts } = useWebSocket()
const emit = defineEmits(['open-config'])
</script>

<template>
  <header>
    <div class="brand">
      <strong>JAMEK SOLUTIONS</strong>
      <span>Automação e Sistemas Industriais - v4.1 Node-RED</span>
    </div>
    
    <div class="connection-status">
      <div class="ws-indicator" :class="{ connected: isConnected, disconnected: !isConnected }">
        <span class="dot"></span>
        <span class="text">{{ isConnected ? 'Node-RED OK' : 'Desconectado' }}</span>
        <span v-if="reconnectAttempts > 0" class="reconnect-badge">{{ reconnectAttempts }}</span>
      </div>
      
      <div class="ws-indicator" :class="{ connected: isESP32Online, disconnected: !isESP32Online }">
        <span class="dot"></span>
        <span class="text">{{ isESP32Online ? 'ESP32 OK' : 'ESP32 Offline' }}</span>
      </div>
      
      <button class="config-btn" @click="emit('open-config')">
        <span>⚙️</span>
        <span>Config</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
header {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  background: rgba(18, 26, 47, 0.95);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand strong {
  font-size: 17px;
  letter-spacing: 1.5px;
  font-weight: 700;
  display: block;
  color: var(--text);
}

.brand span {
  font-size: 10px;
  color: var(--muted);
  opacity: 0.8;
  letter-spacing: 0.5px;
}

.config-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.config-btn:hover {
  background: rgba(255,255,255,0.1);
  border-color: var(--primary);
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 15px;
}

.ws-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 6px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s;
  position: relative;
}

.ws-indicator .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--muted);
  transition: all 0.3s;
}

.ws-indicator.connected .dot {
  background: var(--green);
  box-shadow: 0 0 8px var(--green);
  animation: pulse 2s infinite;
}

.ws-indicator.disconnected .dot {
  background: var(--red);
  animation: blink 1s infinite;
}

.reconnect-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--yellow);
  color: #000;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@media (max-width: 768px) {
  header {
    flex-direction: column;
    gap: 10px;
    padding: 12px 16px;
  }
  
  .connection-status {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
