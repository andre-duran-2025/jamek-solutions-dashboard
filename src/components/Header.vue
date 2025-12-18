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

const { isConnected, isGatewayOnline } = useWebSocket()
const emit = defineEmits(['open-config', 'navigate'])
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
          <span class="badge">v4.1</span>
        </div>
      </div>

      <!-- Context Title (Inverter View) -->
      <div class="context-title" v-else>
        <h2>{{ title }}</h2>
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
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface); /* Changed to surface for consistency */
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
  transition: var(--transition);
}

.left-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: var(--primary);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

h1 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.01em;
  margin: 0;
}

.badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  background: var(--surface-active);
  color: var(--text-muted);
  border-radius: 4px;
}

.btn-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: var(--text-muted);
  transition: var(--transition);
}

.btn-back:hover {
  background: var(--surface-hover);
  color: var(--text-main);
}

.context-title h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
}

.actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

.status-group {
  display: flex;
  gap: 16px;
  padding-right: 24px;
  border-right: 1px solid var(--border);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--danger);
  transition: var(--transition);
}

.status-item.active .dot {
  background: var(--success);
  box-shadow: 0 0 8px var(--success-light);
}

.status-item.active {
  color: var(--text-main);
}

.btn-icon {
  color: var(--text-muted);
  padding: 8px;
  border-radius: 8px;
  transition: var(--transition);
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
