import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import Nav from "./NavGroups";

function Chat({}) {
  const { username } = useAuth();
  const { chat, sendMessage } = useSocket();
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(username, message);
      setMessage("");
    }
  };
  return (
    <>
      <Nav />
      <div className="">
        <h1>Chat</h1>
        <ul id="">
          {chat.map((msg, index) => (
            <li key={index}>
              {msg.username}: {msg.message}
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
