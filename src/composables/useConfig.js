import { ref, watch } from 'vue'

const defaultConfig = {
  host: "192.168.2.24",
  port: 1880,
  useSSL: false
}

const serverConfig = ref({ ...defaultConfig })

export function useConfig() {
  const loadConfig = () => {
    const saved = localStorage.getItem('jamek_config_v3')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Merge with default to ensure all keys exist
        serverConfig.value = { ...defaultConfig, ...parsed }
      } catch (e) {
        console.error("Erro ao carregar config:", e)
      }
    }
  }

  const saveConfig = (newConfig) => {
    serverConfig.value = { ...newConfig }
    localStorage.setItem('jamek_config_v3', JSON.stringify(serverConfig.value))
  }

  // Load immediately
  loadConfig()

  return {
    serverConfig,
    saveConfig,
    loadConfig
  }
}
