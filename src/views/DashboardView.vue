<script setup>
import { computed } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'

const { activeInverterId, setActiveInverter, inverterStates } = useWebSocket()

// Generate array of 21 inverters
const inverters = Array.from({ length: 21 }, (_, i) => i + 1)

const emit = defineEmits(['select'])

const selectInverter = (id) => {
  setActiveInverter(id)
  emit('select', id)
}

const getStatus = (id) => {
  const state = inverterStates[id]
  if (!state) return 'offline'
  if (!state.isESP32Online) return 'offline'
  if (state.isRunning) return 'running'
  return 'stopped'
}

const getFreq = (id) => {
  return inverterStates[id]?.currentFreq || 0
}
</script>

<template>
  <div class="dashboard">
    <div class="grid">
      <div 
        v-for="id in inverters" 
        :key="id"
        class="inverter-card"
        :class="getStatus(id)"
        @click="selectInverter(id)"
      >
        <div class="icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
            <line x1="7" y1="2" x2="7" y2="22"></line>
            <line x1="17" y1="2" x2="17" y2="22"></line>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="2" y1="7" x2="7" y2="7"></line>
            <line x1="2" y1="17" x2="7" y2="17"></line>
            <line x1="17" y1="17" x2="22" y2="17"></line>
            <line x1="17" y1="7" x2="22" y2="7"></line>
          </svg>
        </div>
        <div class="info">
          <h3>Inversor {{ String(id).padStart(2, '0') }}</h3>
          <div class="status-row">
            <span class="status-dot"></span>
            <span class="status-text">
              {{ getStatus(id) === 'running' ? 'Rodando' : (getStatus(id) === 'offline' ? 'Offline' : 'Parado') }}
            </span>
          </div>
          <div class="freq" v-if="getStatus(id) !== 'offline'">
            {{ getFreq(id) }} Hz
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.inverter-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.inverter-card:active {
  transform: scale(0.96);
}

.inverter-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.icon-wrapper {
  background: rgba(255,255,255,0.05);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  transition: all 0.3s;
}

.inverter-card.running .icon-wrapper {
  background: rgba(0, 210, 106, 0.1);
  color: var(--green);
}

.inverter-card.offline .icon-wrapper {
  background: rgba(255, 255, 255, 0.02);
  color: var(--muted);
}

.inverter-card h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.status-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--muted);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--muted);
}

.inverter-card.running .status-dot {
  background: var(--green);
  box-shadow: 0 0 8px var(--green);
}

.inverter-card.stopped .status-dot {
  background: var(--red);
}

.freq {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .inverter-card {
    padding: 12px;
  }
  
  .icon-wrapper {
    width: 40px;
    height: 40px;
  }
  
  .icon {
    width: 24px;
    height: 24px;
  }
}
</style>
