import { useEffect, useState, useCallback } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

export const useSocket = () => {
  const [chat, setChat] = useState([]);

  useEffect(() => {
    const handleNewMessage = (msgObj) => {
      setChat((prevChat) => [...prevChat, msgObj]);
    };
    socket.on("chat message", handleNewMessage);

    return () => socket.off("chat message", handleNewMessage);
  }, [chat]);

  // Innerhalb Ihrer useSocket Hook
  const sendMessage = (msgObj) => {
    console.log(msgObj.username);
    console.log(msgObj.message);
    socket.emit("chat message", msgObj);
  };

  return { chat, sendMessage };
};
