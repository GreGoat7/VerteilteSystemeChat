import { useEffect, useState, useCallback } from "react";
import io from "socket.io-client";
import useGetMessages from "./useGetMessages";

const socket = io("http://localhost:4000");

export const useSocket = () => {
  const { messages, updateMessages } = useGetMessages();
  console.log("messages from usesocket is: ", messages);
  useEffect(() => {
    const handleNewMessage = (msgObj) => {
      updateMessages(msgObj);
    };
    socket.on("chat message", handleNewMessage);

    return () => socket.off("chat message", handleNewMessage);
  }, [messages]);

  // Innerhalb Ihrer useSocket Hook
  const sendMessage = (msgObj) => {
    console.log(msgObj.senderId);
    console.log(msgObj.content);
    console.log(msgObj.senderName);
    console.log(msgObj.senderTimestamp);
    socket.emit("chat message", msgObj);
  };

  return { messages, sendMessage };
};
