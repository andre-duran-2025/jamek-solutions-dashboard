<script setup>
import { Activity, AlertTriangle, CheckCircle2, XCircle } from 'lucide-vue-next';
import EquipmentCard from '@/components/equipment/EquipmentCard.vue';
import { equipments } from '@/data/mockData';
import { useWebSocket } from '@/composables/useWebSocket';
import { computed } from 'vue';

const { isConnected, currentState } = useWebSocket();

const stats = computed(() => {
  return {
    total: equipments.reduce((acc, eq) => acc + (eq.count || 0), 0),
    online: equipments.filter(eq => eq.status === 'online').length,
    offline: equipments.filter(eq => eq.status === 'offline').length,
    fault: equipments.filter(eq => eq.status === 'fault').length,
    warning: equipments.filter(eq => eq.status === 'warning').length,
  };
});
</script>

<template>
  <div class="p-4 md:p-8 max-w-7xl mx-auto">
    <!-- Header -->
    <header class="mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-foreground mb-2">
        Dashboard JAMEK Solutions
      </h1>
      <p class="text-lg text-muted-foreground">
        Monitoramento e controle de equipamentos industriais
      </p>
    </header>

    <!-- Stats Overview -->
    <section class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-card border border-border rounded-xl p-4 animate-fade-in">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity class="w-5 h-5 text-primary" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ stats.total }}</p>
            <p class="text-sm text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      <div class="bg-card border border-border rounded-xl p-4 animate-fade-in" style="animation-delay: 50ms">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <CheckCircle2 class="w-5 h-5 text-success" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ stats.online }}</p>
            <p class="text-sm text-muted-foreground">Online</p>
          </div>
        </div>
      </div>

      <div class="bg-card border border-border rounded-xl p-4 animate-fade-in" style="animation-delay: 100ms">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <AlertTriangle class="w-5 h-5 text-warning" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ stats.warning }}</p>
            <p class="text-sm text-muted-foreground">Alertas</p>
          </div>
        </div>
      </div>

      <div class="bg-card border border-border rounded-xl p-4 animate-fade-in" style="animation-delay: 150ms">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <XCircle class="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ stats.fault }}</p>
            <p class="text-sm text-muted-foreground">Falhas</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Equipment Grid -->
    <section>
      <h2 class="text-xl font-semibold text-foreground mb-4">Equipamentos</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <EquipmentCard 
          v-for="(equipment, index) in equipments" 
          :key="equipment.id" 
          :equipment="equipment" 
          :index="index" 
        />
      </div>
    </section>

    <!-- Footer -->
    <footer class="mt-12 pt-6 border-t border-border">
      <p class="text-sm text-muted-foreground text-center">
        © 2024 JAMEK Solutions — Automação Industrial
      </p>
    </footer>
  </div>
</template>
