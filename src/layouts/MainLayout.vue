<script setup>
import { ref } from 'vue';
import { Menu, Zap } from 'lucide-vue-next';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import { cn } from '@/lib/utils';

const collapsed = ref(false);
const mobileOpen = ref(false);
</script>

<template>
  <div class="min-h-screen flex w-full bg-background">
    <AppSidebar 
      :collapsed="collapsed" 
      :mobileOpen="mobileOpen"
      @toggle-collapse="collapsed = !collapsed"
      @close-mobile="mobileOpen = false"
    />

    <!-- Mobile Header -->
    <div class="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border flex items-center px-4 z-30 md:hidden">
      <button 
        @click="mobileOpen = true"
        class="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent"
      >
        <Menu class="w-6 h-6" />
      </button>
      <div class="ml-4 flex items-center gap-2">
        <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Zap class="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 class="text-lg font-semibold text-foreground tracking-tight">JAMEK</h1>
        </div>
      </div>
    </div>

    <main 
      :class="cn(
        'flex-1 transition-all duration-300 min-h-screen flex flex-col',
        'pt-16 md:pt-0', // Mobile header space
        'ml-0', // Mobile margin
        collapsed ? 'md:ml-16' : 'md:ml-64' // Desktop margin
      )"
    >
      <div class="industrial-grid flex-1">
        <slot></slot>
      </div>
    </main>
  </div>
</template>
