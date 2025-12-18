<script setup>
import { useWebSocket } from '@/composables/useWebSocket'
import { watch, nextTick, ref } from 'vue'

const { logs } = useWebSocket()
const logContainer = ref(null)

watch(logs, () => {
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
}, { deep: true })
</script>

<template>
  <div class="card">
    <h3>Histórico de Eventos</h3>
    <div class="log-container" ref="logContainer">
      <div v-for="(log, index) in logs" :key="index" class="log-entry" :class="log.type">
        <span class="log-time">{{ log.time }}</span>
        <span class="log-message">{{ log.message }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
  transition: var(--transition);
}

.card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card h3 {
  margin: 0 0 1rem 0;
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.log-container {
  max-height: 140px;
  overflow-y: auto;
  font-family: 'Inter', monospace;
  font-size: 0.75rem;
  background: var(--bg);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.log-entry {
  padding: 0.375rem 0;
  border-bottom: 1px solid var(--border);
  display: flex;
  gap: 0.75rem;
  align-items: center;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.log-entry:last-child {
  border-bottom: none;
}

.log-time {
  color: var(--text-muted);
  min-width: 60px;
  font-weight: 500;
  font-size: 0.7rem;
}

.log-message {
  color: var(--text-main);
  flex: 1;
}

.log-entry.info .log-message { color: var(--info); }
.log-entry.success .log-message { color: var(--success); }
.log-entry.error .log-message { color: var(--danger); }
.log-entry.warning .log-message { color: var(--warning); }
</style>
