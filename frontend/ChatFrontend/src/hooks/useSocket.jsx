import { useEffect, useState, useRef, useContext } from "react";
import { useAuth } from "../context/AuthContext";

export const useSocket = (setMessages) => {
  const ws = useRef(null);
  const { token, userId } = useAuth(); // Token und UserId aus dem Authentifizierungskontext abrufen
  // const receivedMessageIds = useRef(new Set()); // Referenz für die IDs der empfangenen Nachrichten

  useEffect(() => {
    // Initialisiere die WebSocket-Verbindung und weise sie ws.current zu
    ws.current = new WebSocket("ws://localhost/ws/");

    ws.current.onopen = () => {
      console.log("WebSocket Verbindung hergestellt.");

      // Sendet regelmäßig eine Nachricht zum Server
      setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "heartbeat", timestamp: Date.now() }));
        }
      }, 10000); // 10 Sekunden

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
      if (message.type === "statusUpdate") {
        // Finde die Nachricht im State und aktualisiere ihren Status
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.messageId === message.messageId
              ? { ...msg, status: message.status }
              : msg
          )
        );
      } else {
        console.log("Nachricht erhalten vor confirmation:", message);

        // Bestätigung des Nachrichtenempfangs senden
        const confirmation = {
          type: "confirmation",
          messageId: message.messageId,
          senderId: message.senderId,
          receiverId: userId, // userId aus dem Auth-Kontext
          groupId: message.groupId,
          status: "empfangen",
        };

        if (message.senderId !== userId) {
          console.log("Bestätigungsnachricht senden:");
          ws.current.send(JSON.stringify(confirmation));
        }
        setMessages((prevMessages) => [...prevMessages, message]);
      }
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
