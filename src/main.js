import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { registerSW } from './pwa/register-sw'

registerSW()

createApp(App).mount('#app')
