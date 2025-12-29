<script setup>
import { ref } from 'vue';
import { useNavigation } from '@/composables/useNavigation';
import { useWebSocket } from '@/composables/useWebSocket';
import { Zap, Activity, Signal, AlertTriangle } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import StatusBadge from '@/components/equipment/StatusBadge.vue';

const { navigateTo } = useNavigation();
const { activeInverterId, inverterStates, isDeviceOnline } = useWebSocket();

// Mock list of inverters
const inverters = Array.from({ length: 21 }, (_, i) => i + 1);

const selectInverter = (id) => {
  activeInverterId.value = id;
  navigateTo('inverter');
};

const getInverterStatus = (id) => {
  // Logic to determine status based on inverterStates
  const state = inverterStates[id];
  if (!state) return 'offline';
  // If we have state, check if online
  if (!isDeviceOnline.value) return 'offline';
  return state.online ? 'online' : 'offline'; // Simplified
};

const getInverterData = (id) => {
  const state = inverterStates[id] || {};
  return {
    frequency: state.frequencia || 0,
    current: state.corrente || 0,
    power: ((state.corrente || 0) * (state.tensao || 220)) / 1000,
  };
};
</script>

<template>
  <div class="p-4 md:p-8 max-w-7xl mx-auto">
    <div class="flex items-center justify-between mb-8 animate-fade-in">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Inversores de Frequência</h1>
        <p class="text-muted-foreground mt-1">Gerenciamento e monitoramento de inversores</p>
      </div>
      <div class="flex gap-2">
        <div class="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium border border-success/20">
          {{ inverters.length }} Total
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="id in inverters"
        :key="id"
        @click="selectInverter(id)"
        :class="cn(
          'group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg cursor-pointer animate-fade-in',
          activeInverterId === id ? 'border-primary/50 bg-primary/5' : ''
        )"
        :style="{ animationDelay: `${id * 100}ms` }"
      >
        <!-- Hover Glow Effect -->
        <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div class="relative z-10">
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <Zap class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-semibold text-foreground">Inversor {{ String(id).padStart(2, '0') }}</h3>
                <p class="text-xs text-muted-foreground">Linha de Produção A</p>
              </div>
            </div>
            <StatusBadge :status="getInverterStatus(id)" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <span class="text-xs text-muted-foreground flex items-center gap-1">
                <Activity class="w-3 h-3" /> Frequência
              </span>
              <p class="text-lg font-mono font-medium text-foreground">
                {{ getInverterData(id).frequency.toFixed(1) }} <span class="text-xs text-muted-foreground">Hz</span>
              </p>
            </div>
            
            <div class="space-y-1">
              <span class="text-xs text-muted-foreground flex items-center gap-1">
                <Signal class="w-3 h-3" /> Corrente
              </span>
              <p class="text-lg font-mono font-medium text-foreground">
                {{ getInverterData(id).current.toFixed(1) }} <span class="text-xs text-muted-foreground">A</span>
              </p>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Potência Atual</span>
            <span class="font-medium text-foreground">{{ getInverterData(id).power.toFixed(1) }} kW</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
