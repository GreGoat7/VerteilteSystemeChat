import { useEffect, useState, useCallback } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

export const useSocket = () => {
  const [chat, setChat] = useState([]);

  useEffect(() => {
    const handleNewMessage = (msg) => {
      setChat((prevChat) => [...prevChat, msg]);
    };
    socket.on("chat message", handleNewMessage);

    return () => socket.off("chat message", handleNewMessage);
  }, [chat]);

  const sendMessage = useCallback((username, message) => {
    console.log("username", username);
    console.log("message", message);
    socket.emit("chat message", { username, message });
  }, []);

  return { chat, sendMessage };
};
