import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import Nav from "./NavGroups";
import "./Css/Chat.css";
import useGroups from "../hooks/useGroups";
import useGetMessages from "../hooks/useGetMessages";
import { v4 as uuidv4 } from "uuid";
import Chattest from "../test/Chattest";

function Chat({}) {
  const { username, userId, token, isLoggedIn } = useAuth();
  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [message, setMessage] = useState("");
  const [activeGroupId, setActiveGroupId] = useState("");
  const { sendMessage } = useSocket(setMessages);
  const {} = useGroups(groups, setGroups); // Annahme, dass dieser Hook die Gruppen und eine Funktion zum Setzen der Gruppen zurückgibt

  const { loading, error } = useGetMessages(activeGroupId, setMessages); // Annahme, dass
  console.log("messages: ", messages);

  const activeGroup = groups.find((group) => {
    return group._id === activeGroupId;
  });

  const activeChat = messages.filter((messages) => {
    return messages.groupId === activeGroupId;
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
        messageId: uuidv4(),
      }); // Anpassung für die korrekte Benennung und Werte
      setMessage("");
    }
  };
  return (
    <>
      <Nav
        groups={groups}
        setGroups={setGroups}
        activeGroupId={activeGroupId}
        setActiveGroupId={setActiveGroupId}
      />
      <Chattest />
    </>
  );
}

export default Chat;
