import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import Nav from "./NavGroups";

function Chat({}) {
  const { username, userId, token, isLoggedIn } = useAuth();
  const { chat, sendMessage } = useSocket([]);
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // Annahme: `userId` ist die eindeutige ID des Benutzers und im Authentifizierungskontext gespeichert
      sendMessage({ senderId: userId, senderName: username, content: message }); // Anpassung für die korrekte Benennung und Werte
      setMessage("");
    }
  };
  console.log("chat", chat);
  return (
    <>
      <Nav />
      <div className="">
        <h1>Chat</h1>
        <ul id="">
          {chat.map((msgObj, index) => (
            <li key={index}>
              {msgObj?.senderName}: {msgObj?.content}
            </li>
          ))}
        </ul>
        <form onSubmit={handleSubmit}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nachricht eingeben"
          />
          <button type="submit">Senden</button>
        </form>
      </div>
    </>
  );
}

export default Chat;
