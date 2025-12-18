<script setup>
import { useToast } from '@/composables/useToast'
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-vue-next'

const { toasts } = useToast()

const getIcon = (type) => {
  switch (type) {
    case 'success': return CheckCircle2
    case 'warning': return AlertTriangle
    case 'error': return XCircle
    default: return Info
  }
}

const getTypeClasses = (type) => {
  switch (type) {
    case 'success': return 'border-l-4 border-l-green-500'
    case 'warning': return 'border-l-4 border-l-yellow-500'
    case 'error': return 'border-l-4 border-l-red-500'
    default: return 'border-l-4 border-l-blue-500'
  }
}

const getIconColor = (type) => {
  switch (type) {
    case 'success': return 'text-green-500'
    case 'warning': return 'text-yellow-500'
    case 'error': return 'text-red-500'
    default: return 'text-blue-500'
  }
}
</script>

<template>
  <div class="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 flex flex-col gap-3 pointer-events-none">
    <transition-group 
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-[-1rem] opacity-0 md:translate-y-0 md:translate-x-8"
      enter-to-class="translate-y-0 opacity-100 md:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="pointer-events-auto bg-card border border-border rounded-lg shadow-lg p-4 flex items-start gap-3"
        :class="getTypeClasses(toast.type)"
      >
        <component :is="getIcon(toast.type)" class="w-5 h-5 mt-0.5" :class="getIconColor(toast.type)" />
        <p class="text-sm font-medium text-foreground">{{ toast.message }}</p>
      </div>
    </transition-group>
  </div>
</template>
