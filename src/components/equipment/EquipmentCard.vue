<script setup>
import { Zap, Cog, Gauge, Cpu, Wind, Activity, ArrowRight } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import StatusBadge from './StatusBadge.vue';
import { useNavigation } from '@/composables/useNavigation';

const props = defineProps({
  equipment: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
});

const { navigateTo } = useNavigation();

const iconMap = {
  Zap,
  Cog,
  Gauge,
  Cpu,
  Wind,
  Activity,
};

const Icon = iconMap[props.equipment.icon] || Zap;

const handleClick = () => {
  // Map routes to views
  if (props.equipment.route === '/inversores') {
    navigateTo('inverters');
  } else {
    // For now stay on dashboard or handle other views
    console.log('Navigate to:', props.equipment.route);
  }
};
</script>

<template>
  <button
    @click="handleClick"
    :class="cn(
      'group relative w-full text-left bg-card border border-border rounded-xl p-5',
      'hover:border-primary/50 hover:bg-card/80 transition-all duration-300',
      'focus:outline-none focus:ring-2 focus:ring-primary/50',
      'animate-fade-in'
    )"
    :style="{ animationDelay: `${index * 50}ms` }"
  >
    <!-- Glow effect on hover -->
    <div class="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    <div class="relative z-10">
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div :class="cn(
          'w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-300',
          equipment.status === 'online' && 'bg-success/10 text-success',
          equipment.status === 'offline' && 'bg-muted text-muted-foreground',
          equipment.status === 'fault' && 'bg-destructive/10 text-destructive',
          equipment.status === 'warning' && 'bg-warning/10 text-warning'
        )">
          <component :is="Icon" class="w-6 h-6" />
        </div>
        <StatusBadge :status="equipment.status" size="sm" />
      </div>

      <!-- Content -->
      <h3 class="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
        {{ equipment.name }}
      </h3>
      <p class="text-sm text-muted-foreground mb-4">
        {{ equipment.description }}
      </p>

      <!-- Footer -->
      <div class="flex items-center justify-between">
        <span v-if="equipment.count !== undefined" class="text-2xl font-bold text-foreground">
          {{ equipment.count }}
          <span class="text-sm font-normal text-muted-foreground ml-1">unidades</span>
        </span>
        <div class="flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          Acessar
          <ArrowRight class="w-4 h-4" />
        </div>
      </div>
    </div>
  </button>
</template>
