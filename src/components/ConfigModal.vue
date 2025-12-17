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
  background: rgba(0,0,0,0.8);
  z-index: 9999;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.modal-overlay.show {
  display: flex;
}

.modal {
  background: var(--card);
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  border: 1px solid var(--border);
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.modal h2 {
  margin-bottom: 20px;
  color: var(--text);
  font-size: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--muted);
  font-weight: 500;
}

.form-group input[type="text"],
.form-group input[type="number"] {
  width: 100%;
  padding: 10px;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary);
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.modal-actions button {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-secondary {
  background: rgba(255,255,255,0.05);
  color: var(--text);
  border: 1px solid var(--border);
}
</style>
