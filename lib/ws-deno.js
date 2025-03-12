// Deno WebSocket adapter for Gun
export class WebSocket {
  constructor(url, protocols) {
    this.url = url;
    this.protocols = protocols;
    this.readyState = 0; // CONNECTING
    this._init();
  }

  async _init() {
    try {
      this._ws = await Deno.connect({
        hostname: new URL(this.url).hostname,
        port: parseInt(new URL(this.url).port || "80"),
        transport: "tcp"
      });
      this.readyState = 1; // OPEN
      if (this.onopen) this.onopen();
    } catch (e) {
      this.readyState = 3; // CLOSED
      if (this.onerror) this.onerror(e);
    }
  }

  send(data) {
    if (this.readyState !== 1) return;
    try {
      const encoder = new TextEncoder();
      this._ws.write(encoder.encode(data));
    } catch (e) {
      if (this.onerror) this.onerror(e);
    }
  }

  close() {
    if (this.readyState === 3) return;
    try {
      this._ws.close();
      this.readyState = 3; // CLOSED
      if (this.onclose) this.onclose();
    } catch (e) {
      if (this.onerror) this.onerror(e);
    }
  }

  // Event handlers
  onopen = null;
  onclose = null;
  onmessage = null;
  onerror = null;

  // Constants
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
}

// Export WebSocket Server
export class WebSocketServer {
  constructor(options) {
    this.options = options;
    this.clients = new Set();
    this._init();
  }

  async _init() {
    try {
      const listener = Deno.listen({ port: this.options.port });
      for await (const conn of listener) {
        this._handleConnection(conn);
      }
    } catch (e) {
      if (this.options.onError) this.options.onError(e);
    }
  }

  async _handleConnection(conn) {
    const ws = {
      send: async (data) => {
        const encoder = new TextEncoder();
        await conn.write(encoder.encode(data));
      },
      close: () => {
        conn.close();
        this.clients.delete(ws);
      }
    };
    this.clients.add(ws);
    
    if (this.options.onConnection) {
      this.options.onConnection(ws);
    }

    // Handle incoming messages
    const decoder = new TextDecoder();
    try {
      for await (const chunk of conn.readable) {
        const message = decoder.decode(chunk);
        if (ws.onmessage) {
          ws.onmessage({ data: message });
        }
      }
    } catch (e) {
      ws.close();
    }
  }
}

// Export the module
export default {
  WebSocket,
  WebSocketServer,
  Server: WebSocketServer
}; 