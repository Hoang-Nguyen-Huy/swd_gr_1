import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { KafkaCryptoEvent } from "../types/crypto";

export class WebSocketService {
  private client: Client;
  private isConnected: boolean = false;
  private wsUrl: string;

  constructor() {
    this.wsUrl =
      import.meta.env.VITE_WEBSOCKET_URL || "http://localhost:9090/ws";

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl),
      connectHeaders: {},
      debug: (str) => {
        console.log("WebSocket Debug:", str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log("Connected to WebSocket:", frame);
      this.isConnected = true;
    };

    this.client.onDisconnect = () => {
      console.log("Disconnected from WebSocket");
      this.isConnected = false;
    };

    this.client.onStompError = (frame) => {
      console.error("Broker reported error:", frame.headers["message"]);
      console.error("Additional details:", frame.body);
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      this.client.onConnect = (frame) => {
        console.log("Connected to WebSocket:", frame);
        this.isConnected = true;
        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error("WebSocket connection error:", frame);
        reject(
          new Error(frame.headers["message"] || "WebSocket connection failed")
        );
      };

      this.client.activate();
    });
  }

  disconnect(): void {
    if (this.client && this.isConnected) {
      this.client.deactivate();
      this.isConnected = false;
    }
  }

  subscribe(topic: string, callback: (message: KafkaCryptoEvent) => void) {
    if (!this.isConnected) {
      console.error("WebSocket is not connected");
      return;
    }

    return this.client.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const webSocketService = new WebSocketService();
