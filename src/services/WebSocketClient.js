// websocket-client.js 
// Cliente WebSocket para integração com Vue.js 

class WebSocketClient { 
  constructor(url, options = {}) { 
    this.url = url; 
    this.ws = null; 
    this.reconnectInterval = null; 
    this.reconnectDelay = options.reconnectDelay || 2000; 
    this.maxReconnectDelay = 30000; // Máximo de 30s
    this.autoReconnect = options.autoReconnect !== false; 
    this.maxReconnectAttempts = options.maxReconnectAttempts || Infinity; 
    this.reconnectAttempts = 0; 
    
    // Callbacks 
    this.onConnected = options.onConnected || (() => {}); 
    this.onDisconnected = options.onDisconnected || (() => {}); 
    this.onMessage = options.onMessage || (() => {}); 
    this.onError = options.onError || (() => {}); 
    this.onReconnecting = options.onReconnecting || (() => {}); 
    
    // Estado 
    this.isConnected = false; 
    this.isConnecting = false; 
  } 

  // Conectar ao WebSocket 
  connect() { 
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) { 
      console.warn('WebSocket já está conectado ou conectando'); 
      return; 
    } 

    this.isConnecting = true; 
    console.log(`Conectando ao WebSocket: ${this.url}`); 

    try { 
      this.ws = new WebSocket(this.url); 

      this.ws.onopen = () => { 
        this.isConnected = true; 
        this.isConnecting = false; 
        this.reconnectAttempts = 0; 
        clearInterval(this.reconnectInterval); 
        this.reconnectInterval = null; 
        
        console.log('WebSocket conectado'); 
        this.onConnected(); 
      }; 

      this.ws.onmessage = (event) => { 
        try { 
          const data = JSON.parse(event.data); 
          this.onMessage(data, event); 
        } catch (e) { 
          // Se não for JSON, passa como string 
          this.onMessage(event.data, event); 
        } 
      }; 

      this.ws.onerror = (error) => { 
        console.error('WebSocket erro:', error); 
        this.onError(error); 
        // Ensure socket is closed on error to trigger reconnect logic
        if (this.ws) this.ws.close();
      }; 

      this.ws.onclose = (event) => { 
        this.isConnected = false; 
        this.isConnecting = false; 
        
        console.log('WebSocket desconectado', event.code, event.reason); 
        this.onDisconnected(event); 

        // Reconectar automaticamente 
        if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) { 
          this.scheduleReconnect(); 
        } 
      }; 

    } catch (error) { 
      this.isConnecting = false; 
      console.error('Erro ao criar WebSocket:', error); 
      this.onError(error); 
    } 
  } 

  // Agendar reconexão 
  scheduleReconnect() { 
    if (this.reconnectInterval) return; 

    this.reconnectAttempts++; 
    console.log(`Tentando reconectar em ${this.reconnectDelay}ms (tentativa ${this.reconnectAttempts})`); 
    
    this.onReconnecting(this.reconnectAttempts); 

    this.reconnectInterval = setInterval(() => { 
      this.connect(); 
    }, this.reconnectDelay); 
  } 

  // Desconectar 
  disconnect() { 
    this.autoReconnect = false; 
    
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null; 
    }

    if (this.ws) { 
      // Evita disparar onclose novamente
      this.ws.onclose = null; 
      this.ws.onerror = null;
      this.ws.close(); 
      this.ws = null; 
    } 

    this.isConnected = false; 
    this.isConnecting = false; 
    this.reconnectAttempts = 0; 
  } 

  // Enviar mensagem 
  send(data) { 
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) { 
      console.error('WebSocket não está conectado'); 
      return false; 
    } 

    try { 
      const message = typeof data === 'string' ? data : JSON.stringify(data); 
      this.ws.send(message); 
      return true; 
    } catch (error) { 
      console.error('Erro ao enviar mensagem:', error); 
      this.onError(error); 
      return false; 
    } 
  } 

  // Verificar status 
  getStatus() { 
    return { 
      isConnected: this.isConnected, 
      isConnecting: this.isConnecting, 
      reconnectAttempts: this.reconnectAttempts, 
      readyState: this.ws ? this.ws.readyState : null 
    }; 
  } 
} 

// Exportar para uso como módulo ES6 
export default WebSocketClient;