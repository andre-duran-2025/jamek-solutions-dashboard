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
  background: var(--surface);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
  transition: var(--transition);
}

.card:hover {
  border-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card h3 {
  margin: 0 0 var(--space-4) 0;
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}

.status-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-2) 0;
}

.status-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--danger);
  border: 2px solid rgba(0,0,0,0.2);
  transition: var(--transition);
}

.status-indicator.on {
  background: var(--success);
  box-shadow: 0 0 16px var(--success-light);
}

.status-indicator.offline {
  background: var(--text-muted);
  box-shadow: none;
}

.status-text {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  transition: var(--transition);
  font-family: 'Inter', monospace;
  color: var(--danger); /* Default to Red (Parado) */
}

.status-text.on { 
  color: var(--success); 
}

.status-text.off { 
  color: var(--danger); 
}

.status-text.offline {
  color: var(--text-muted);
}

.status-text.offline {
  color: var(--text-muted);
}
</style>
