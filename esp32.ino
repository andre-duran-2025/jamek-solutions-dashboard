// ============================================
// ESP32 v7.0 PROFESSIONAL - PRODUCTION READY
// WiFiManager + MQTT Config + WDT + Modbus Otimizado
// ============================================

#include <WiFi.h>
#include <WiFiManager.h>  // https://github.com/tzapu/WiFiManager
#include <PubSubClient.h>
#include "ModbusMaster.h" // Biblioteca Local Otimizada
#include <Preferences.h>  // Para salvar config na Flash
#include <esp_task_wdt.h> // Watchdog Timer

/* ================== CONFIG DEFAULTS ================== */

#define TOTAL_INVERSORES 21
#define WDT_TIMEOUT 10    // 10 segundos para resetar se travar

// Configurações Padrão (serão sobrescritas pelo WiFiManager)
char mqtt_server[40] = "149.28.236.238";
char mqtt_port[6] = "1883";
char mqtt_user[32] = "";
char mqtt_pass[32] = "";
char mqtt_client_id[32] = "ESP32_v7_PRO";

#define RXD2 16
#define TXD2 17
#define RE_DE 4
#define LED 2
#define RESET_WIFI_BTN 0  // Botão BOOT da placa (GPIO 0)

#define MIN_FREQ 0
#define MAX_FREQ 60

/* ================== REGISTRADORES ================== */

#define REG_STATUS 0x001C
#define REG_FREQ_SAIDA 0x101F
#define REG_FREQ_SETPOINT 0x2001
#define REG_CMD 0x2000

/* ================== OBJETOS ================== */

WiFiClient espClient;
PubSubClient client(espClient);
ModbusMaster node;
WiFiManager wifiManager;
Preferences preferences;

/* ================== ESTRUTURA DE DADOS ================== */

struct Inv {
  uint8_t id;
  bool online = false;
  bool rodando = false;
  bool reverso = false;
  uint16_t freq = 0;
  uint8_t erros = 0;
};

Inv inv[TOTAL_INVERSORES];

struct Comando {
  uint8_t inv_id;
  uint8_t cmd_type;  // 0=start, 1=stop, 2=freq, 3=direcao
  uint16_t value;
};

/* ================== FILAS E SEMÁFOROS ================== */

QueueHandle_t cmdQueue;
SemaphoreHandle_t modbusMutex;
uint8_t lastModbusId = 0;

/* ================== CONTROLE DE BOTÃO ================== */

unsigned long buttonPressStart = 0;
unsigned long lastBlinkTime = 0;
bool buttonPressed = false;
bool resetInProgress = false;

/* ================== CALLBACKS WIFI MANAGER ================== */

bool shouldSaveConfig = false;

void saveConfigCallback () {
  Serial.println("DADOS SALVOS NO MODO AP!");
  shouldSaveConfig = true;
}

/* ================== RS485 CONTROLE ================== */

void preTransmission() { digitalWrite(RE_DE, HIGH); }
void postTransmission() { digitalWrite(RE_DE, LOW); }

/* ================== MODBUS SEGURO ================== */

uint16_t readReg(uint8_t id, uint16_t reg) {
  if (xSemaphoreTake(modbusMutex, pdMS_TO_TICKS(200)) != pdTRUE) {
    return 0xFFFF;
  }
  
  if (id != lastModbusId) {
    node.begin(id, Serial2);
    node.setTimeout(200); // Timeout dinâmico da lib local
    lastModbusId = id;
  }
  
  uint8_t r = node.readHoldingRegisters(reg, 1);
  uint16_t v = (r == node.ku8MBSuccess) ? node.getResponseBuffer(0) : 0xFFFF;
  
  xSemaphoreGive(modbusMutex);
  return v;
}

bool writeReg(uint8_t id, uint16_t reg, uint16_t val) {
  if (xSemaphoreTake(modbusMutex, pdMS_TO_TICKS(1000)) != pdTRUE) {
    return false;
  }
  
  if (id != lastModbusId) {
    node.begin(id, Serial2);
    node.setTimeout(200);
    lastModbusId = id;
  }
  
  uint8_t r = node.writeSingleRegister(reg, val);
  
  xSemaphoreGive(modbusMutex);
  return (r == node.ku8MBSuccess);
}

/* ================== MQTT HELPER ================== */

void pub(uint8_t id, const char* k, const char* v) {
  if (!client.connected()) return;
  
  char t[64];
  snprintf(t, sizeof(t), "inversor/%d/status/%s", id, k);
  client.publish(t, v);
}

/* ================== LÓGICA DE COMANDO ================== */

void executarComando(const Comando& cmd) {
  uint8_t id = cmd.inv_id;
  if (id < 1 || id > TOTAL_INVERSORES) return;
  
  Inv& i = inv[id - 1];
  
  Serial.printf("CMD: %d INV: %d\n", cmd.cmd_type, id);
  
  switch (cmd.cmd_type) {
    case 0: // START
      if (writeReg(id, REG_CMD, i.reverso ? 0x000A : 0x0006)) {
        i.rodando = true;
        pub(id, "rodando", "1");
        Serial.println("OK");
      }
      break;
      
    case 1: // STOP
      if (writeReg(id, REG_CMD, 0x0001)) {
        i.rodando = false;
        pub(id, "rodando", "0");
        Serial.println("OK");
      }
      break;
      
    case 2: // FREQ
      if (cmd.value >= MIN_FREQ && cmd.value <= MAX_FREQ) {
        if (writeReg(id, REG_FREQ_SETPOINT, cmd.value * 10)) {
          i.freq = cmd.value;
          char buf[8];
          snprintf(buf, sizeof(buf), "%d", cmd.value);
          pub(id, "frequencia", buf);
          Serial.println("OK");
        }
      }
      break;
      
    case 3: // DIRECAO
      i.reverso = !i.reverso;
      pub(id, "direcao", i.reverso ? "reverso" : "frente");
      if (i.rodando) {
        writeReg(id, REG_CMD, i.reverso ? 0x000A : 0x0006);
      }
      Serial.println("OK");
      break;
  }
}

/* ================== TASKS ================== */

void mqttTask(void* param) {
  Serial.println("MQTT Task iniciada");
  
  while(1) {
    // Feed watchdog para esta task se necessário (mas aqui usamos delay longo)
    // O WDT principal está no loop()
    
    if (!client.connected()) {
      if (WiFi.status() == WL_CONNECTED) {
        Serial.println("Reconectando MQTT...");
        
        // Tenta conectar com ou sem senha
        bool connected = false;
        if (strlen(mqtt_user) > 0) {
          connected = client.connect(mqtt_client_id, mqtt_user, mqtt_pass);
        } else {
          connected = client.connect(mqtt_client_id);
        }

        if (connected) {
          Serial.println("MQTT conectado!");
          client.subscribe("inversor/+/cmd/#");
        } else {
          Serial.printf("MQTT falhou: %d. Tenta em 5s\n", client.state());
          vTaskDelay(pdMS_TO_TICKS(5000));
          continue;
        }
      }
    }
    
    if (client.connected()) {
      client.loop();
    }
    
    vTaskDelay(pdMS_TO_TICKS(10));
  }
}

void cmdTask(void* param) {
  Serial.println("Command Task iniciada");
  Comando cmd;
  
  while(1) {
    if (xQueueReceive(cmdQueue, &cmd, pdMS_TO_TICKS(100)) == pdTRUE) {
      executarComando(cmd);
    }
    // Yield para evitar travar CPU
    vTaskDelay(pdMS_TO_TICKS(10));
  }
}

void pollTask(void* param) {
  Serial.println("Poll Task iniciada");
  uint8_t idx = 0;
  
  while(1) {
    Inv& i = inv[idx];
    
    // Leitura otimizada: Apenas status se offline
    uint16_t st = readReg(i.id, REG_STATUS);
    
    if (st == 0xFFFF) {
      if (++i.erros >= 5 && i.online) {
        i.online = false;
        pub(i.id, "online", "0");
      }
    } else {
      if (!i.online) {
        i.online = true;
        pub(i.id, "online", "1");
      }
      i.erros = 0;
      
      bool run = (st > 0);
      if (run != i.rodando) {
        i.rodando = run;
        pub(i.id, "rodando", run ? "1" : "0");
      }
      
      // Leitura de frequência intercalada (menos prioritária)
      if (idx % 5 == 0) {
        uint16_t fr = readReg(i.id, REG_FREQ_SAIDA);
        if (fr != 0xFFFF) {
          uint16_t hz = fr / 10;
          if (hz != i.freq) {
            i.freq = hz;
            char buf[8];
            snprintf(buf, sizeof(buf), "%d", hz);
            pub(i.id, "frequencia", buf);
          }
        }
      }
    }
    
    if (++idx >= TOTAL_INVERSORES) idx = 0;
    
    // Pequeno delay para não saturar o barramento
    vTaskDelay(pdMS_TO_TICKS(50));
  }
}

/* ================== MQTT CALLBACK ================== */

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  int id;
  char cmd_str[16];
  
  if (sscanf(topic, "inversor/%d/cmd/%15s", &id, cmd_str) != 2) return;
  if (id < 1 || id > TOTAL_INVERSORES) return;
  
  Comando cmd;
  cmd.inv_id = id;
  cmd.value = 0;
  
  if (strcmp(cmd_str, "start") == 0) cmd.cmd_type = 0;
  else if (strcmp(cmd_str, "stop") == 0) cmd.cmd_type = 1;
  else if (strcmp(cmd_str, "frequencia") == 0) {
    cmd.cmd_type = 2;
    char val_buf[8];
    uint8_t len = (length < 7) ? length : 7;
    memcpy(val_buf, payload, len);
    val_buf[len] = '\0';
    cmd.value = atoi(val_buf);
  }
  else if (strcmp(cmd_str, "direcao") == 0) cmd.cmd_type = 3;
  else return;
  
  if (xQueueSend(cmdQueue, &cmd, pdMS_TO_TICKS(100)) != pdTRUE) {
    Serial.println("ERRO: Fila cheia!");
  }
}

/* ================== CONFIG MANAGEMENT ================== */

void loadConfig() {
  preferences.begin("esp_config", true); // Modo leitura
  
  String s_server = preferences.getString("mqtt_server", mqtt_server);
  String s_port = preferences.getString("mqtt_port", mqtt_port);
  String s_user = preferences.getString("mqtt_user", mqtt_user);
  String s_pass = preferences.getString("mqtt_pass", mqtt_pass);
  String s_client = preferences.getString("mqtt_client", mqtt_client_id);
  
  s_server.toCharArray(mqtt_server, 40);
  s_port.toCharArray(mqtt_port, 6);
  s_user.toCharArray(mqtt_user, 32);
  s_pass.toCharArray(mqtt_pass, 32);
  s_client.toCharArray(mqtt_client_id, 32);
  
  preferences.end();
  
  Serial.println("\n--- CONFIG CARREGADA ---");
  Serial.printf("Server: %s:%s\n", mqtt_server, mqtt_port);
  Serial.printf("Client: %s\n", mqtt_client_id);
  Serial.println("------------------------");
}

void saveConfig() {
  preferences.begin("esp_config", false); // Modo escrita
  
  preferences.putString("mqtt_server", mqtt_server);
  preferences.putString("mqtt_port", mqtt_port);
  preferences.putString("mqtt_user", mqtt_user);
  preferences.putString("mqtt_pass", mqtt_pass);
  preferences.putString("mqtt_client", mqtt_client_id);
  
  preferences.end();
  Serial.println("Configurações salvas na Flash!");
}

/* ================== SETUP ================== */

void setup() {
  Serial.begin(115200);
  
  // 1. Carrega Configurações
  loadConfig();
  
  // 2. Hardware Init
  pinMode(RE_DE, OUTPUT);
  digitalWrite(RE_DE, LOW);
  pinMode(LED, OUTPUT);
  pinMode(RESET_WIFI_BTN, INPUT_PULLUP);
  
  Serial2.begin(9600, SERIAL_8N1, RXD2, TXD2);
  
  // 3. Modbus Setup
  node.begin(1, Serial2); 
  node.setTimeout(200);
  node.preTransmission(preTransmission);
  node.postTransmission(postTransmission);
  
  modbusMutex = xSemaphoreCreateMutex();
  cmdQueue = xQueueCreate(10, sizeof(Comando));
  
  // 4. WiFiManager Setup
  WiFiManagerParameter custom_mqtt_server("server", "MQTT Server", mqtt_server, 40);
  WiFiManagerParameter custom_mqtt_port("port", "MQTT Port", mqtt_port, 6);
  WiFiManagerParameter custom_mqtt_user("user", "MQTT User", mqtt_user, 32);
  WiFiManagerParameter custom_mqtt_pass("pass", "MQTT Pass", mqtt_pass, 32);
  WiFiManagerParameter custom_mqtt_client("client", "Client ID", mqtt_client_id, 32);

  wifiManager.setSaveConfigCallback(saveConfigCallback);
  wifiManager.addParameter(&custom_mqtt_server);
  wifiManager.addParameter(&custom_mqtt_port);
  wifiManager.addParameter(&custom_mqtt_user);
  wifiManager.addParameter(&custom_mqtt_pass);
  wifiManager.addParameter(&custom_mqtt_client);

  wifiManager.setConfigPortalTimeout(180);

  if (!wifiManager.autoConnect("ESP32-PRO-CONFIG", "admin123")) {
    Serial.println("Falha na conexão. Reiniciando...");
    delay(3000);
    ESP.restart();
  }

  // 5. Salva se houve alteração no Portal
  if (shouldSaveConfig) {
    strcpy(mqtt_server, custom_mqtt_server.getValue());
    strcpy(mqtt_port, custom_mqtt_port.getValue());
    strcpy(mqtt_user, custom_mqtt_user.getValue());
    strcpy(mqtt_pass, custom_mqtt_pass.getValue());
    strcpy(mqtt_client_id, custom_mqtt_client.getValue());
    saveConfig();
  }

  // 6. MQTT Setup
  client.setServer(mqtt_server, atoi(mqtt_port));
  client.setCallback(mqttCallback);
  
  // 7. Tasks
  xTaskCreatePinnedToCore(mqttTask, "MQTT", 8192, NULL, 2, NULL, 0);
  xTaskCreatePinnedToCore(cmdTask, "CMD", 4096, NULL, 2, NULL, 0);
  xTaskCreatePinnedToCore(pollTask, "Poll", 4096, NULL, 1, NULL, 1);

  // 8. Watchdog Init (10s)
  esp_task_wdt_config_t wdt_config = {
    .timeout_ms = WDT_TIMEOUT * 1000,
    .idle_core_mask = (1 << 0) | (1 << 1),
    .trigger_panic = true
  };
  esp_task_wdt_init(&wdt_config);
  esp_task_wdt_add(NULL); // Adiciona o loop atual (Arduino loop) ao WDT

  Serial.println("✅ SISTEMA INICIADO COM SUCESSO");
}

/* ================== LOOP ================== */

void loop() {
  // Reset do Watchdog
  esp_task_wdt_reset();
  
  // Verifica botão de reset físico
  if (digitalRead(RESET_WIFI_BTN) == LOW) {
    unsigned long start = millis();
    while (digitalRead(RESET_WIFI_BTN) == LOW) {
      if (millis() - start > 3000) {
        digitalWrite(LED, HIGH);
        Serial.println("RESETANDO WIFI...");
        wifiManager.resetSettings();
        preferences.begin("esp_config", false);
        preferences.clear(); // Limpa também configs MQTT
        preferences.end();
        ESP.restart();
      }
      delay(100);
    }
  }
  
  // Heartbeat no Serial e MQTT
  static unsigned long lastHB = 0;
  if (millis() - lastHB > 30000) {
    lastHB = millis();
    if (client.connected()) {
      char buf[64];
      snprintf(buf, sizeof(buf), "{\"up\":%lu,\"heap\":%u}", millis()/1000, ESP.getFreeHeap());
      client.publish("inversor/gateway/heartbeat", buf);
    }
  }
  
  delay(1000);
}
