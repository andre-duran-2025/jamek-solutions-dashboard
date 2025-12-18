<script setup>
import { computed, ref, watch } from 'vue';
import { useWebSocket } from '@/composables/useWebSocket';
import { useNavigation } from '@/composables/useNavigation';
import { 
  ArrowLeft, 
  Zap, 
  Activity, 
  Thermometer, 
  Gauge, 
  Power,
  Play,
  Square,
  RotateCcw,
  RotateCw,
  Settings,
  TrendingUp,
  Sliders,
  ArrowRightLeft
} from 'lucide-vue-next';
import DataCard from '@/components/ui/DataCard.vue';
import ControlButton from '@/components/ui/ControlButton.vue';
import StatusBadge from '@/components/equipment/StatusBadge.vue';
import { useToast } from '@/composables/useToast';
import { cn } from '@/lib/utils';

const { 
  activeInverterId, 
  inverterStates, 
  currentFreq, 
  setpointFreq, 
  sendCommand, 
  isRunning,
  isESP32Online,
  isConnected
} = useWebSocket();

const { navigateTo } = useNavigation();
const { showToast } = useToast();

// Local state for sliders to prevent jumping while dragging
const localFreq = ref(0);
const isDragging = ref(false);

const inverter = computed(() => {
  const state = inverterStates[activeInverterId.value] || {};
  return {
    name: `Inversor ${String(activeInverterId.value).padStart(2, '0')}`,
    status: isESP32Online.value ? (isRunning.value ? 'online' : 'offline') : 'offline', 
    running: isRunning.value,
    frequency: currentFreq.value || 0,
    setpoint: setpointFreq.value || 0,
    current: state.corrente || 0,
    voltage: state.tensao || 220, 
    power: (state.corrente || 0) * (state.tensao || 220) / 1000, 
    temperature: state.temperatura || 45,
    direction: state.direcao || 'frente'
  };
});

// Sync local slider with remote setpoint when not dragging
watch(() => inverter.value.setpoint, (newVal) => {
  if (!isDragging.value) {
    localFreq.value = newVal;
  }
}, { immediate: true });

const handleStart = () => {
  sendCommand('start');
  showToast(`Comando de partida enviado para ${inverter.value.name}`, 'success');
};

const handleStop = () => {
  sendCommand('stop');
  showToast(`Comando de parada enviado para ${inverter.value.name}`, 'info');
};

const handleReset = () => {
  sendCommand('reset');
  showToast(`Reset de falha enviado para ${inverter.value.name}`, 'warning');
};

const handleDirection = () => {
  sendCommand('direcao');
  showToast(`Comando de inversão de rotação enviado`, 'info');
};

const handleFrequencyChange = (event) => {
  const val = Number(event.target.value);
  localFreq.value = val;
  sendCommand('freq', val);
};

const emit = defineEmits(['open-config']);
</script>

<template>
  <div class="p-4 md:p-8 max-w-6xl mx-auto">
    <!-- Breadcrumb -->
    <button
      @click="navigateTo('inverters')"
      class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
    >
      <ArrowLeft class="w-4 h-4" />
      <span class="text-sm">Voltar para Inversores</span>
    </button>

    <!-- Header -->
    <header class="mb-8 animate-fade-in">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap class="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 class="text-3xl font-bold text-foreground">{{ inverter.name }}</h1>
            <div class="flex items-center gap-3 mt-1">
              <StatusBadge :status="inverter.status" size="md" />
              <span class="text-muted-foreground">
                {{ inverter.running ? 'Em operação' : 'Parado' }}
                <span v-if="inverter.running" class="ml-1 text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                  {{ inverter.direction === 'frente' ? 'Horário' : 'Anti-horário' }}
                </span>
              </span>
            </div>
          </div>
        </div>
        <button 
          @click="emit('open-config')"
          class="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <Settings class="w-4 h-4" />
          Configurações
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Data Cards -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Primary Metrics -->
        <section>
          <h2 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity class="w-5 h-5 text-primary" />
            Parâmetros de Operação
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DataCard
              title="Frequência"
              :value="inverter.frequency"
              unit="Hz"
              :icon="Activity"
              variant="default"
            />
            <DataCard
              title="Corrente"
              :value="inverter.current"
              unit="A"
              :icon="Zap"
              variant="default"
            />
            <DataCard
              title="Tensão"
              :value="inverter.voltage"
              unit="V"
              :icon="Gauge"
              variant="default"
            />
            <DataCard
              title="Temperatura"
              :value="inverter.temperature"
              unit="°C"
              :icon="Thermometer"
              :variant="inverter.temperature > 60 ? 'warning' : 'default'"
            />
          </div>
        </section>

        <!-- Secondary Metrics -->
        <section>
          <h2 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp class="w-5 h-5 text-primary" />
            Performance
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataCard
              title="Potência Estimada"
              :value="inverter.power.toFixed(1)"
              unit="kW"
              :icon="Power"
              class="md:col-span-1"
            />
            <DataCard
              title="Setpoint Atual"
              :value="inverter.setpoint"
              unit="Hz"
              :icon="Activity"
              variant="default"
            />
          </div>
        </section>
        
        <!-- Frequency Control -->
        <section class="bg-card border rounded-xl p-6">
           <h2 class="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Sliders class="w-5 h-5 text-primary" />
            Ajuste de Velocidade
          </h2>
          
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-muted-foreground">Frequência Desejada</span>
              <span class="text-2xl font-bold text-foreground">{{ localFreq }} <span class="text-sm text-muted-foreground font-normal">Hz</span></span>
            </div>
            
            <div class="relative w-full h-12 flex items-center">
              <input 
                type="range" 
                min="0" 
                max="60" 
                step="1"
                v-model="localFreq"
                @mousedown="isDragging = true"
                @touchstart="isDragging = true"
                @mouseup="isDragging = false"
                @touchend="isDragging = false"
                @change="handleFrequencyChange"
                class="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            
            <div class="flex justify-between text-xs text-muted-foreground">
              <span>0 Hz</span>
              <span>15 Hz</span>
              <span>30 Hz</span>
              <span>45 Hz</span>
              <span>60 Hz</span>
            </div>
          </div>
        </section>
      </div>

      <!-- Controls -->
      <div class="space-y-6">
        <section class="bg-card border rounded-xl p-6">
          <h2 class="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Power class="w-5 h-5 text-primary" />
            Controle Manual
          </h2>
          <div class="flex flex-col gap-3">
            <div class="grid grid-cols-2 gap-3">
              <ControlButton
                label="Iniciar"
                :icon="Play"
                variant="start"
                @click="handleStart"
                :disabled="!isConnected"
              />
              <ControlButton
                label="Parar"
                :icon="Square"
                variant="stop"
                @click="handleStop"
                :disabled="!isConnected"
              />
            </div>
            
            <ControlButton
              :label="inverter.direction === 'frente' ? 'Inverter (Horário)' : 'Inverter (Anti-Horário)'"
              :icon="ArrowRightLeft"
              variant="default"
              @click="handleDirection"
              :disabled="!isConnected"
            />
            
            <ControlButton
              label="Reset de Falha"
              :icon="RotateCcw"
              variant="reset"
              @click="handleReset"
              :disabled="!isConnected"
            />
          </div>
        </section>

        <!-- Status -->
        <section class="bg-card border rounded-xl p-6">
          <h2 class="text-lg font-semibold text-foreground mb-4">Status do Sistema</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between py-2 border-b border-border">
              <span class="text-muted-foreground">Estado</span>
              <span class="font-medium text-foreground capitalize">{{ inverter.status }}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-border">
              <span class="text-muted-foreground">Modo</span>
              <span class="font-medium text-foreground">Remoto (Node-RED)</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-border">
              <span class="text-muted-foreground">Direção</span>
              <span class="font-medium text-foreground capitalize">{{ inverter.direction }}</span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-muted-foreground">Conexão</span>
              <span class="flex items-center gap-2 text-sm">
                <span class="w-2 h-2 rounded-full" :class="isConnected ? 'bg-success' : 'bg-destructive'"></span>
                {{ isConnected ? 'Conectado' : 'Desconectado' }}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
