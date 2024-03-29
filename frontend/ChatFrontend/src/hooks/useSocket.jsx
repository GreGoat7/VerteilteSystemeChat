import { useEffect, useState, useRef, useContext } from "react";
import { useAuth } from "../context/AuthContext";

export const useSocket = (setMessages) => {
  const ws = useRef(null);
  const { token, userId } = useAuth(); // Token und UserId aus dem Authentifizierungskontext abrufen

  useEffect(() => {
    // Initialisiere die WebSocket-Verbindung und weise sie ws.current zu
    ws.current = new WebSocket("ws://localhost/ws/");

    ws.current.onopen = () => {
      console.log("WebSocket Verbindung hergestellt.");

      // Sende eine Initialisierungsnachricht mit Benutzer-ID und Token
      if (ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type: "init",
            userId: userId,
            token: token,
          })
        );
      }
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
  }, [setMessages, token, userId]);

  const sendMessage = (msgObj) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msgObj));
    } else {
      console.error("WebSocket ist nicht geöffnet.");
    }
  };

  return { sendMessage };
};
