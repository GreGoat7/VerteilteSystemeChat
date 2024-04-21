import { Flex } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import Footer from "./Footer";
import Header from "./Header";
import Messages from "./Messages";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import Nav from "../components/NavGroups";
import "../components/Css/Chat.css";
import useGroups from "../hooks/useGroups";
import useGetMessages from "../hooks/useGetMessages";
import { v4 as uuidv4 } from "uuid";

const Chattest = () => {
  const { username, userId, token, isLoggedIn } = useAuth();
  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [activeGroupId, setActiveGroupId] = useState("");
  const { sendMessage } = useSocket(setMessages);
  const {} = useGroups(groups, setGroups); // Annahme, dass dieser Hook die Gruppen und eine Funktion zum Setzen der Gruppen zurückgibt

  const { loading, error } = useGetMessages(activeGroupId, setMessages); // Annahme, dass
  console.log("messages: ", messages);

  const activeGroup = groups.find((group) => {
    return group._id === activeGroupId;
  });
  console.log("activegoupr", activeGroup);
  const activeChat = messages.filter((messages) => {
    return messages.groupId === activeGroupId;
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      // Annahme: `userId` ist die eindeutige ID des Benutzers und im Authentifizierungskontext gespeichert
      sendMessage({
        senderId: userId,
        senderName: username,
        content: inputMessage,
        groupId: activeGroupId,
        senderTimestamp: Date.now(),
        messageId: uuidv4(),
      }); // Anpassung für die korrekte Benennung und Werte
      setInputMessage("");
    }
    // <div className="chat">
    //     <div className="chat-box">
    //       <h1>{activeGroup?.name}</h1>
    //       <div id="chat-messages">
    //         <ul>
    //           {activeChat?.map((msgObj, index) => (
    //             <li key={index}>
    //               {msgObj?.senderName}: {msgObj?.content}
    //             </li>
    //           ))}
    //         </ul>
    //       </div>
    //       <form onSubmit={handleSubmit}>
    //         <input
    //           value={message}
    //           onChange={(e) => setMessage(e.target.value)}
    //           placeholder="Nachricht eingeben"
    //         />
    //         <button type="submit">Senden</button>
    //       </form>
    //     </div>
    //   </div>
  };
  console.log("messages", messages);

  return (
    <>
      <Nav
        groups={groups}
        setGroups={setGroups}
        activeGroupId={activeGroupId}
        setActiveGroupId={setActiveGroupId}
      />
      <Flex
        w="70%"
        h="90vh"
        justify="center"
        align="center"
        pos="fixed"
        marginLeft="325px"
      >
        <Flex
          w="60%"
          h="90%"
          flexDir="column"
          style={{ border: "2px solid black", padding: "10px" }}
          borderRadius="20px"
        >
          <Header chatName={activeGroup?.name} />
          <Messages messages={messages} />
          <Footer
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
          />
        </Flex>
      </Flex>
    </>
  );
};

export default Chattest;
