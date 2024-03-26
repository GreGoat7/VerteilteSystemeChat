import { useEffect, useState, useRef } from "react";

export const useSocket = (setMessages) => {
  const ws = useRef(null);

  useEffect(() => {
    // Initialisiere die WebSocket-Verbindung und weise sie ws.current zu
    ws.current = new WebSocket("ws://localhost/ws/");

    ws.current.onopen = () => {
      console.log("WebSocket Verbindung hergestellt.");
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Nachricht erhalten:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    ws.current.onclose = () => {
      console.log("WebSocket Verbindung geschlossen.");
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket Fehler:", error);
    };

    return () => {
      // Schließe die WebSocket-Verbindung beim Aufräumen
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [setMessages]);

  const sendMessage = (msgObj) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msgObj));
    } else {
      console.error("WebSocket ist nicht geöffnet.");
    }
  };

  return { sendMessage };
};
