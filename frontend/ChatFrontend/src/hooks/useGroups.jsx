import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const useGroups = (groups, setGroups) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchGroups();
  }, [token]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost/api/getGroups", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("hiii", response);
      setGroups(response.data);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const createGroup = async (groupName) => {
    console.log("1");
    setLoading(true);
    try {
      console.log("1");
      const response = await axios.post(
        "http://localhost/api/createGroup",
        { groupName },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoading(false);
      return response.data.group;
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

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

  return { createDirectChat, createGroup, loading, error };
};

export default useGroups;
