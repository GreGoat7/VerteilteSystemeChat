import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const useAddGroupMember = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const addGroupMember = async (groupId, userIdToAdd) => {
    setLoading(true);
    try {
      await axios.post(
        "http://localhost:4000/api/addGroupMember",
        { groupId, userIdToAdd },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLoading(false);
    } catch (err) {
      console.log("error in addGroupMember", err);
      setError(err);
      setLoading(false);
    }
  };

  return { addGroupMember, loading, error };
};

export default useAddGroupMember;
