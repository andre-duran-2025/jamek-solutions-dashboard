<script setup>
import { ref, watch } from 'vue'
import { useConfig } from '@/composables/useConfig'
import { useToast } from '@/composables/useToast'
import { useWebSocket } from '@/composables/useWebSocket'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const { serverConfig, saveConfig: saveConfigStore } = useConfig()
const { showToast } = useToast()
const { connect, disconnect, reconnectAttempts } = useWebSocket()

const form = ref({
  host: '',
  port: 1880,
  useSSL: false
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    form.value = { ...serverConfig.value }
  }
})

const saveConfig = () => {
  saveConfigStore(form.value)
  emit('close')
  
  showToast("Configuração salva - reconectando...", "success")
  
  disconnect()
  setTimeout(() => {
    reconnectAttempts.value = 0
    connect()
  }, 500)
}
</script>

<template>
  <div class="modal-overlay" :class="{ show: isOpen }">
    <div class="modal">
      <h2>⚙️ Configurações</h2>
      <div class="form-group">
        <label>Endereço do Servidor Node-RED</label>
        <input type="text" v-model="form.host" placeholder="IP ou domínio (ex: 149.28.236.238)">
      </div>
      <div class="form-group">
        <label>Porta WebSocket</label>
        <input type="number" v-model="form.port" placeholder="1880">
      </div>
      <div class="form-group">
        <label>Usar SSL (wss://)</label>
        <input type="checkbox" v-model="form.useSSL">
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" @click="emit('close')">Cancelar</button>
        <button class="btn-primary" @click="saveConfig">Salvar e Reconectar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.8); /* Slate-900 with opacity */
  z-index: 9999;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  transition: var(--transition);
}

.modal-overlay.show {
  display: flex;
  animation: fadeIn 0.2s ease-out;
}

.modal {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  max-width: 500px;
  width: 90%;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  transform: scale(0.95);
  opacity: 0;
  animation: scaleIn 0.2s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal h2 {
  margin-bottom: 1.5rem;
  color: var(--text-main);
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
}

.modal-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>
