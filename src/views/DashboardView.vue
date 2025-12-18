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
  if (!state.online) return 'offline'
  if (state.rodando) return 'running'
  return 'stopped'
}

const getFreq = (id) => {
  return inverterStates[id]?.frequencia || 0
}
</script>

<template>
  <div class="dashboard-view">
    <div class="container">
      <div class="header-section">
        <h2>Visão Geral</h2>
        <p>Monitoramento em tempo real de 21 inversores</p>
      </div>
      
      <div class="grid">
        <button 
          v-for="id in inverters" 
          :key="id"
          class="card inverter-card"
          :class="getStatus(id)"
          @click="selectInverter(id)"
        >
          <div class="card-header">
            <span class="inv-id">INV-{{ String(id).padStart(2, '0') }}</span>
            <div class="status-indicator"></div>
          </div>
          
          <div class="card-body">
            <div class="icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
            </div>
            
            <div class="metrics">
              <span class="value" v-if="getStatus(id) !== 'offline'">
                {{ getFreq(id) }} <small>Hz</small>
              </span>
              <span class="value offline" v-else>--</span>
              <span class="label">{{ getStatus(id) === 'running' ? 'Operando' : (getStatus(id) === 'offline' ? 'Offline' : 'Parado') }}</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-view {
  padding: var(--space-8) var(--space-6);
  flex: 1;
  background: var(--bg);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: var(--space-8);
}

.header-section h2 {
  font-size: 1.5rem;
  margin-bottom: var(--space-2);
  color: var(--text-main);
}

.header-section p {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-6);
}

.inverter-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  text-align: left;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  /* inherited .card styles apply too */
}

.inverter-card:hover {
  /* inherited .card:hover applies */
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.inv-id {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--surface-active);
  box-shadow: 0 0 0 2px var(--bg);
}

/* Status Colors */
.inverter-card.running .status-indicator {
  background: var(--success);
  box-shadow: 0 0 0 2px var(--bg), 0 0 8px var(--success-light);
}

.inverter-card.running .icon-box {
  color: var(--success);
  background: var(--success-light);
  border: 1px solid var(--success);
}

.inverter-card.stopped .status-indicator {
  background: var(--danger);
  box-shadow: 0 0 0 2px var(--bg), 0 0 8px var(--danger-light);
}

.inverter-card.stopped .icon-box {
  color: var(--danger);
  background: var(--danger-light);
  border: 1px solid var(--danger);
}

.inverter-card.offline .status-indicator {
  background: var(--text-muted);
}

.inverter-card.offline .icon-box {
  opacity: 0.5;
}

.card-body {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.icon-box {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-hover);
  color: var(--text-muted);
  transition: var(--transition);
}

.metrics {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1;
  margin-bottom: var(--space-1);
  font-family: 'Inter', monospace;
}

.value small {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-muted);
}

.value.offline {
  color: var(--text-dim);
}

.label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

@media (max-width: 600px) {
  .dashboard-view {
    padding: 20px 16px;
  }
  
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .inverter-card {
    padding: 1rem;
  }
  
  .value {
    font-size: 1.25rem;
  }
}
</style>
