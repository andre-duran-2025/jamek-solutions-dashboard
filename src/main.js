import { createApp } from 'vue'
import { injectSpeedInsights } from '@vercel/speed-insights'
import './style.css'
import App from './App.vue'
import { registerSW } from './pwa/register-sw'

injectSpeedInsights()

registerSW()

createApp(App).mount('#app')
