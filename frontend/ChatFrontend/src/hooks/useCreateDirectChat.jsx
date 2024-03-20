import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const useCreateDirectChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const createDirectChat = async (partnerId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost/api/directChat",
        { partnerId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLoading(false);
      return response.data.directChat; // Rückgabe der Antwort des Servers
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  return { createDirectChat, loading, error };
};

export default useCreateDirectChat;
