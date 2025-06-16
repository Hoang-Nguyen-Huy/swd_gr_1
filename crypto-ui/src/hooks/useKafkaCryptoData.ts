import { useState, useEffect, useCallback } from 'react';
import { webSocketService } from '../services/websocketService';
import { KafkaCryptoEvent } from '../types/crypto';

interface UseKafkaCryptoDataReturn {
  cryptoEvents: KafkaCryptoEvent[];
  connectionStatus: boolean;
  error: string | null;
  reconnect: () => void;
}

const useKafkaCryptoData = (): UseKafkaCryptoDataReturn => {
  const [cryptoEvents, setCryptoEvents] = useState<KafkaCryptoEvent[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const connectToWebSocket = useCallback(async () => {
    try {
      await webSocketService.connect();
      setConnectionStatus(true);
      setError(null);

      // Subscribe to crypto topic
      webSocketService.subscribe('/topic/crypto', (event: KafkaCryptoEvent) => {
        console.log('Received crypto event:', event);
        
        setCryptoEvents(prevEvents => {
          // Keep only the latest 100 events to prevent memory issues
          const updatedEvents = [event, ...prevEvents].slice(0, 100);
          return updatedEvents;
        });
      });

    } catch (err) {
      console.error('Failed to connect to WebSocket:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to WebSocket');
      setConnectionStatus(false);
    }
  }, []);

  const reconnect = useCallback(() => {
    webSocketService.disconnect();
    setConnectionStatus(false);
    setTimeout(() => {
      connectToWebSocket();
    }, 1000);
  }, [connectToWebSocket]);

  useEffect(() => {
    connectToWebSocket();

    // Cleanup on unmount
    return () => {
      webSocketService.disconnect();
    };
  }, [connectToWebSocket]);

  // Check connection status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const isConnected = webSocketService.getConnectionStatus();
      setConnectionStatus(isConnected);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    cryptoEvents,
    connectionStatus,
    error,
    reconnect,
  };
};

export default useKafkaCryptoData;
