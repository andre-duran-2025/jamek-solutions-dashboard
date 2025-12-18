<script setup>
import { ref } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'
import { useNavigation } from '@/composables/useNavigation'
import MainLayout from '@/layouts/MainLayout.vue'
import DashboardView from '@/views/DashboardView.vue'
import InverterView from '@/views/InverterView.vue'
import InverterListView from '@/views/InverterListView.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import ConfigModal from '@/components/ConfigModal.vue'

const { connect, disconnect } = useWebSocket()
const { currentView } = useNavigation()
const showConfig = ref(false)

// Initial connection
connect()
</script>

<template>
  <ToastContainer />
  <ConfigModal :isOpen="showConfig" @close="showConfig = false" />
  
  <MainLayout>
    <transition name="fade" mode="out-in">
      <DashboardView v-if="currentView === 'dashboard'" />
      <InverterView 
        v-else-if="currentView === 'inverter'" 
        @open-config="showConfig = true"
      />
      <InverterListView v-else-if="currentView === 'inverters'" />
      <!-- Placeholder for other views -->
      <div v-else class="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <span class="text-2xl">🚧</span>
        </div>
        <h2 class="text-xl font-semibold mb-2">Em Desenvolvimento</h2>
        <p class="text-muted-foreground">A página {{ currentView }} está sendo construída.</p>
      </div>
    </transition>
  </MainLayout>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
