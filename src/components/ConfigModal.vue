<script setup>
import { ref, watch } from 'vue'
import { useConfig } from '@/composables/useConfig'
import { useToast } from '@/composables/useToast'
import { useWebSocket } from '@/composables/useWebSocket'
import { Settings, X } from 'lucide-vue-next'

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
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
    <div class="w-full max-w-md bg-card border border-border rounded-lg shadow-lg p-6 animate-scale-in mx-4">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <Settings class="w-5 h-5 text-primary" />
          <h2 class="text-xl font-semibold text-foreground">Configurações</h2>
        </div>
        <button @click="emit('close')" class="text-muted-foreground hover:text-foreground transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium text-muted-foreground">Endereço do Servidor Node-RED</label>
          <input 
            type="text" 
            v-model="form.host" 
            placeholder="IP ou domínio (ex: 149.28.236.238)"
            class="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
          >
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-muted-foreground">Porta WebSocket</label>
          <input 
            type="number" 
            v-model="form.port" 
            placeholder="1880"
            class="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
          >
        </div>

        <div class="flex items-center gap-3 py-2">
          <input 
            type="checkbox" 
            id="useSSL"
            v-model="form.useSSL"
            class="w-4 h-4 rounded border-input bg-background text-primary focus:ring-ring"
          >
          <label for="useSSL" class="text-sm font-medium text-muted-foreground select-none cursor-pointer">
            Usar conexão segura (SSL/WSS)
          </label>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-8">
        <button 
          @click="emit('close')"
          class="px-4 py-2 text-sm font-medium text-secondary-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
        >
          Cancelar
        </button>
        <button 
          @click="saveConfig"
          class="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
        >
          Salvar e Reconectar
        </button>
      </div>
    </div>
  </div>
</template>
