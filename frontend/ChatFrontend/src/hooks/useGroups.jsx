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

  const createGroup = async (groupName) => {
    console.log("1");
    setLoading(true);
    try {
      console.log("1");
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

      setLoading(false);
      return response.data.group;
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  return { createGroup, loading, error };
};

export default useGroups;
