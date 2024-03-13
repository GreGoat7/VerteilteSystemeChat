import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import Nav from "./NavGroups";
import "./Chat.css";
import useGroups from "../hooks/useGroups";
import useGetMessages from "../hooks/useGetMessages";

function Chat({}) {
  const { username, userId, token, isLoggedIn } = useAuth();
  const { sendMessage } = useSocket([]);
  const [message, setMessage] = useState("");
  const [activeGroupId, setActiveGroupId] = useState(
    "65f07d5546dc97ca23a8d316"
  );
  const { groups } = useGroups(); // Annahme, dass dieser Hook die Gruppen und eine Funktion zum Setzen der Gruppen zurückgibt
  const activeGroup = groups.find((group) => {
    return group._id === activeGroupId;
  });
  const { messages, loading, error } = useGetMessages(activeGroupId); // Annahme, dass
  console.log("messages: ", messages);
  const activeChat = messages.filter((messages) => {
    return messages.group === activeGroupId;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // Annahme: `userId` ist die eindeutige ID des Benutzers und im Authentifizierungskontext gespeichert
      sendMessage({
        senderId: userId,
        senderName: username,
        content: message,
        groupId: activeGroupId,
        senderTimestamp: Date.now(),
      }); // Anpassung für die korrekte Benennung und Werte
      setMessage("");
    }
  };
  console.log("actviveGroupid", activeGroupId);
  return (
    <>
      <Nav
        groups={groups}
        activeGroupId={activeGroupId}
        setActiveGroupId={setActiveGroupId}
      />
      <div className="chat">
        <div className="chat-box">
          <h1>{activeGroup?.name}</h1>
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
