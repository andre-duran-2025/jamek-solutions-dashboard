<script setup>
import { useWebSocket } from '@/composables/useWebSocket'

const { isRunning, isESP32Online } = useWebSocket()
</script>

<template>
  <div class="card">
    <h3>Status do Inversor</h3>
    <div class="status-display">
      <div 
        class="status-indicator" 
        :class="{ 
          on: isRunning && isESP32Online, 
          offline: !isESP32Online 
        }"
      ></div>
      <div 
        class="status-text" 
        :class="{ 
          on: isRunning && isESP32Online, 
          off: !isRunning && isESP32Online,
          offline: !isESP32Online 
        }"
      >
        {{ !isESP32Online ? 'OFFLINE' : (isRunning ? 'RODANDO' : 'PARADO') }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--card);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
  transition: all 0.2s;
}

.card:hover {
  border-color: rgba(37, 99, 235, 0.3);
  transform: translateY(-2px);
}

.card h3 {
  margin: 0 0 12px 0;
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 1.2px;
  font-weight: 600;
}

.status-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 0;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--red);
  transition: all 0.3s;
}

.status-indicator.on {
  background: var(--green);
  box-shadow: 0 0 12px var(--green);
}

.status-indicator.offline {
  background: var(--muted);
  box-shadow: none;
}

.status-text {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 2px;
  transition: all 0.3s;
}

.status-text.on { 
  color: var(--green); 
}

.status-text.off { 
  color: var(--red); 
}

.status-text.offline {
  color: var(--muted);
}
</style>
