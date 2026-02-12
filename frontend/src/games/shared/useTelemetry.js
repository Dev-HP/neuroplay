import { useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * Hook de Telemetria Unificado
 * Coleta e envia dados de performance cognitiva para análise
 */
export function useTelemetry(gameModule) {
  const sessionId = useRef(uuidv4());
  const eventBuffer = useRef([]);
  const flushInterval = 5000; // 5 segundos
  const maxBufferSize = 50;

  useEffect(() => {
    // Inicia sessão
    logSessionStart();

    // Timer para flush periódico
    const timer = setInterval(() => {
      flushEvents();
    }, flushInterval);

    // Cleanup: flush final ao desmontar
    return () => {
      clearInterval(timer);
      logSessionEnd();
      flushEvents();
    };
  }, []);

  const logSessionStart = () => {
    const event = {
      session_id: sessionId.current,
      game_module: gameModule,
      event_type: 'session_start',
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      screen_resolution: `${window.screen.width}x${window.screen.height}`
    };
    
    eventBuffer.current.push(event);
  };

  const logSessionEnd = () => {
    const event = {
      session_id: sessionId.current,
      game_module: gameModule,
      event_type: 'session_end',
      timestamp: new Date().toISOString()
    };
    
    eventBuffer.current.push(event);
  };

  const logEvent = (eventData) => {
    const event = {
      session_id: sessionId.current,
      game_module: gameModule,
      timestamp: new Date().toISOString(),
      ...eventData
    };

    eventBuffer.current.push(event);

    // Flush imediato se buffer cheio
    if (eventBuffer.current.length >= maxBufferSize) {
      flushEvents();
    }
  };

  const flushEvents = async () => {
    if (eventBuffer.current.length === 0) return;

    const events = [...eventBuffer.current];
    eventBuffer.current = [];

    try {
      const response = await fetch('/api/telemetry/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events })
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar telemetria');
      }
    } catch (error) {
      console.error('Erro ao enviar telemetria:', error);
      // Re-adiciona ao buffer para retry
      eventBuffer.current.unshift(...events);
    }
  };

  return {
    logEvent,
    sessionId: sessionId.current,
    flushEvents
  };
}
