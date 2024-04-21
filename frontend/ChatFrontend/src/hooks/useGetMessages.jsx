import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";

const useGetMessages = (groupId, setMessages, sendConfirmations) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, userId } = useAuth();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost/api/groups/${groupId}/messages`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("response is", response);
        setMessages(response.data);

        // Filter messages that need confirmation and send them in one go
        const messagesNeedingConfirmation = response.data.filter(
          (message) =>
            message.senderId !== userId && message.status !== "empfangen"
        );
        console.log("messagesNeedingConfirmation", messagesNeedingConfirmation);

        sendConfirmations(messagesNeedingConfirmation);
      } catch (err) {
        console.log(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchMessages();
    }
  }, [groupId]);

  const updateMessages = async (newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  return { loading, error, updateMessages };
};

export default useGetMessages;
