<script setup>
import { Home, Zap, Cog, Gauge, Cpu, Wind, Activity, ChevronLeft, ChevronRight, X } from 'lucide-vue-next';
import { computed } from 'vue';
import { cn } from '@/lib/utils';
import { useNavigation } from '@/composables/useNavigation';

const props = defineProps({
  collapsed: {
    type: Boolean,
    required: true
  },
  mobileOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['toggle-collapse', 'close-mobile']);

const { currentView, navigateTo } = useNavigation();

const menuItems = [
  { icon: Home, label: 'Home', path: 'dashboard' },
  { icon: Zap, label: 'Inversores', path: 'inverters' },
  { icon: Cog, label: 'Motores', path: 'motores' },
  { icon: Gauge, label: 'Sensores', path: 'sensores' },
  { icon: Cpu, label: 'CLPs', path: 'clps' },
  { icon: Wind, label: 'Exaustão', path: 'exaustao' },
  { icon: Activity, label: 'Energia', path: 'energia' },
];

const isActive = (path) => currentView.value === path;

const handleNavigation = (path) => {
  navigateTo(path);
  emit('close-mobile');
};
</script>

<template>
  <!-- Mobile Overlay -->
  <div 
    v-if="mobileOpen" 
    class="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
    @click="emit('close-mobile')"
  />

  <aside
    :class="cn(
      'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col',
      // Mobile: fixed width, transform based on open state
      'w-64 -translate-x-full md:translate-x-0',
      mobileOpen && 'translate-x-0 shadow-xl',
      // Desktop: width based on collapsed state
      !mobileOpen && (collapsed ? 'md:w-16' : 'md:w-64')
    )"
  >
    <!-- Logo -->
    <div class="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Zap class="w-5 h-5 text-primary-foreground" />
        </div>
        <div v-if="!collapsed || mobileOpen" class="animate-fade-in">
          <h1 class="text-lg font-semibold text-foreground tracking-tight">JAMEK</h1>
          <p class="text-xs text-muted-foreground -mt-1">Solutions</p>
        </div>
      </div>
      <!-- Mobile Close Button -->
      <button 
        @click="emit('close-mobile')"
        class="md:hidden p-1 text-muted-foreground hover:text-foreground"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
      <button
        v-for="item in menuItems"
        :key="item.path"
        @click="handleNavigation(item.path)"
        :class="cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
          isActive(item.path)
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        )"
      >
        <component 
          :is="item.icon"
          :class="cn(
            'w-5 h-5 flex-shrink-0 transition-colors',
            isActive(item.path) ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
          )"
        />
        <span v-if="!collapsed || mobileOpen" class="text-sm font-medium animate-fade-in">{{ item.label }}</span>
      </button>
    </nav>

    <!-- Collapse Button (Desktop Only) -->
    <div class="hidden md:block p-2 border-t border-sidebar-border">
      <button
        @click="emit('toggle-collapse')"
        class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
      >
        <ChevronRight v-if="collapsed" class="w-5 h-5" />
        <template v-else>
          <ChevronLeft class="w-5 h-5" />
          <span class="text-sm">Recolher</span>
        </template>
      </button>
    </div>
  </aside>
</template>
