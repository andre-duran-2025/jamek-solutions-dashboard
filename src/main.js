import { createApp } from 'vue'
import { inject } from '@vercel/speed-insights'
import './style.css'
import App from './App.vue'
import { registerSW } from './pwa/register-sw'

// Initialize Vercel Speed Insights
inject()

registerSW()

createApp(App).mount('#app')
