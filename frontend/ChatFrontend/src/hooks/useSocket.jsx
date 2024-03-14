import { useEffect, useState, useCallback } from "react";
import io from "socket.io-client";
import useGetMessages from "./useGetMessages";

const socket = io("http://localhost:4000");

export const useSocket = (setMessages) => {
  useEffect(() => {
    const handleNewMessage = (msgObj) => {
      console.log("gets executed");
      setMessages((prevMessages) => [...prevMessages, msgObj]);
    };
    socket.on("chat message", handleNewMessage);

    return () => socket.off("chat message", handleNewMessage);
  }, []);

  // Innerhalb Ihrer useSocket Hook
  const sendMessage = (msgObj) => {
    console.log(msgObj.senderId);
    console.log(msgObj.content);
    console.log(msgObj.senderName);
    console.log(msgObj.senderTimestamp);
    socket.emit("chat message", msgObj);
  };

  return { sendMessage };
};
