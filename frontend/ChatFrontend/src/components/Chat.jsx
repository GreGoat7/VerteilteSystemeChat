import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import Nav from "./NavGroups";
import "./Chat.css";

function Chat({}) {
  const { username, userId, token, isLoggedIn } = useAuth();
  const { chat, sendMessage } = useSocket([]);
  const [message, setMessage] = useState("");
  const [activeGroupId, setActiveGroupId] = useState(1);
  const [groups, setGroups] = useState([
    { type: "group", id: 1, name: "Gruppe 1" },
    { type: "group", id: 2, name: "Gruppe 2" },
    { type: "chat", id: 3, name: "Chat with guy" },
  ]);
  console.log("groupss", groups);
  const activeGroup = groups.find((group) => {
    return group.id === activeGroupId;
  });

  const activeChat = chat.filter((chat) => {
    console.log("chat", chat);
    return chat.chatId === activeGroupId;
  });
  console.log("activegroup", activeGroup);

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
      <Nav
        groups={groups}
        setGroups={setGroups}
        activeGroupId={activeGroupId}
        setActiveGroupId={setActiveGroupId}
      />
      <div className="chat">
        <div className="chat-box">
          <h1>{activeGroup.name}</h1>
          <div id="chat-messages">
            <ul>
              {activeChat?.map((msgObj, index) => (
                <li key={index}>
                  {msgObj?.senderName}: {msgObj?.content}
                </li>
              ))}
            </ul>
          </div>
          <form onSubmit={handleSubmit}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nachricht eingeben"
            />
            <button type="submit">Senden</button>
          </form>
        </div>

      </div>
    </>
  );
}

export default Chat;
