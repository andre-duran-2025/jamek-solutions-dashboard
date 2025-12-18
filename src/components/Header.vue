<script setup>
import { useWebSocket } from '@/composables/useWebSocket'

const props = defineProps({
  view: {
    type: String,
    default: 'dashboard'
  },
  title: {
    type: String,
    default: ''
  }
})

const { isConnected, isGatewayOnline, activeInverterId, inverterStates } = useWebSocket()
const emit = defineEmits(['open-config', 'navigate'])

const currentLatency = computed(() => {
  if (props.view === 'inverter') {
    return inverterStates[activeInverterId.value]?.latency || 0
  }
  return 0
})
</script>

<template>
  <header>
    <div class="left-section">
      <!-- Back Button (Only in Inverter View) -->
      <button v-if="view === 'inverter'" class="btn-back" @click="emit('navigate', 'dashboard')">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </button>

      <!-- Brand / Logo (Always visible or contextual) -->
      <div class="brand" v-if="view === 'dashboard'">
        <div class="logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M12 12l4-4m-4 4l-4 4"/></svg>
        </div>
        <div class="brand-text">
          <h1>JAMEK</h1>
          <span class="badge">v5.4</span>
        </div>
      </div>

      <!-- Context Title (Inverter View) -->
      <div class="context-title" v-else>
        <h2>{{ title }}</h2>
        <span v-if="currentLatency > 0" class="latency-badge">{{ currentLatency }}ms</span>
      </div>
    </div>
    
    <div class="actions">
      <div class="status-group">
        <div class="status-item" :class="{ active: isConnected }">
          <span class="dot"></span>
          <span class="label">Server</span>
        </div>
        <div class="status-item" :class="{ active: isGatewayOnline }">
          <span class="dot"></span>
          <span class="label">ESP32</span>
        </div>
      </div>
      
      <button class="btn-icon" @click="emit('open-config')" title="Configurações">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
      </button>
    </div>
  </header>
</template>

<style scoped>
header {
  height: var(--space-16);
  padding: 0 var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
  transition: var(--transition);
}

.left-section {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: var(--primary);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.latency-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary);
  background: rgba(59, 130, 246, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
}

.brand-text {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.brand-text h1 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.025em;
}

.badge {
  background: var(--surface-active);
  color: var(--text-muted);
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.btn-back {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: var(--transition);
}

.btn-back:hover {
  background: var(--surface-hover);
  color: var(--text-main);
}

.context-title h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-main);
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.status-group {
  display: flex;
  gap: var(--space-4);
  padding-right: var(--space-4);
  border-right: 1px solid var(--border);
}

.status-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--danger);
  box-shadow: 0 0 0 2px var(--surface);
  transition: var(--transition);
}

.status-item.active .dot {
  background: var(--success);
  box-shadow: 0 0 0 2px var(--surface), 0 0 8px var(--success-light);
}

.label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: var(--transition);
  background: transparent;
}

.btn-icon:hover {
  background: var(--surface-hover);
  color: var(--text-main);
}

@media (max-width: 600px) {
  header {
    padding: 0 16px;
  }
  
  .status-group {
    display: none;
  }
  
  .badge {
    display: none;
  }
}
</style>
