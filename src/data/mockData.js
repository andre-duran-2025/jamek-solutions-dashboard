export const getStatusLabel = (status) => {
  const labels = {
    online: 'Online',
    offline: 'Offline',
    fault: 'Falha',
    warning: 'Alerta',
  };
  return labels[status] || status;
};

export const equipments = [
  {
    id: 'inversores',
    name: 'Inversores de Frequência',
    type: 'inverter',
    icon: 'Zap',
    status: 'online',
    description: 'Controle de velocidade de motores',
    count: 21,
    route: '/inversores',
  },
  {
    id: 'motores',
    name: 'Motores',
    type: 'motor',
    icon: 'Cog',
    status: 'online',
    description: 'Motores elétricos industriais',
    count: 45,
    route: '/motores',
  },
  {
    id: 'sensores',
    name: 'Sensores',
    type: 'sensor',
    icon: 'Gauge',
    status: 'warning',
    description: 'Sensores de temperatura e pressão',
    count: 128,
    route: '/sensores',
  },
  {
    id: 'clps',
    name: 'CLPs',
    type: 'plc',
    icon: 'Cpu',
    status: 'online',
    description: 'Controladores Lógicos Programáveis',
    count: 8,
    route: '/clps',
  },
  {
    id: 'exaustao',
    name: 'Sistema de Exaustão',
    type: 'exhaust',
    icon: 'Wind',
    status: 'fault',
    description: 'Ventilação e exaustão industrial',
    count: 12,
    route: '/exaustao',
  },
  {
    id: 'energia',
    name: 'Monitoramento de Energia',
    type: 'energy',
    icon: 'Activity',
    status: 'online',
    description: 'Medição e análise de consumo',
    count: 6,
    route: '/energia',
  },
];
