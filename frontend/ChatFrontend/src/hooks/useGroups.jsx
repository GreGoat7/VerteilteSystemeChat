import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const useGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchGroups();
  }, [token]);

  useEffect(() => {
    createGroup("grupperinnerhalbusegrou");
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:4000/api/getGroups", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setGroups(response.data);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const setNewGroup = () => {
    fetchGroups();
  };

  const createGroup = async (groupName) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:4000/api/createGroup",
        { groupName },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setGroups((prev) => prev);
      setGroups((prev) => {
        return [...prev, response.data.group];
      });
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  return { groups, createGroup, loading, error };
};

export default useGroups;
