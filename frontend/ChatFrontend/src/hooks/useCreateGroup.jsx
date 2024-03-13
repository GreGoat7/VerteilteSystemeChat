import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const useCreateGroup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const createGroup = async (groupName) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:4000/api/createGroup",
        {
          groupName,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLoading(false);
      return response.data.group; // oder eine Erfolgsmeldung
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  return { createGroup, loading, error };
};

export default useCreateGroup;
