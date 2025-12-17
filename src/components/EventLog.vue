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

.log-container {
  max-height: 140px;
  overflow-y: auto;
  font-family: 'SF Mono', 'Courier New', monospace;
  font-size: 10px;
  background: rgba(0,0,0,0.3);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.log-entry {
  padding: 5px 0;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  display: flex;
  gap: 10px;
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
  color: var(--muted);
  min-width: 70px;
  font-weight: 500;
}

.log-message {
  color: var(--text);
  flex: 1;
}

.log-entry.info .log-message { color: var(--primary); }
.log-entry.success .log-message { color: var(--green); }
.log-entry.error .log-message { color: var(--red); }
.log-entry.warning .log-message { color: var(--yellow); }
</style>
