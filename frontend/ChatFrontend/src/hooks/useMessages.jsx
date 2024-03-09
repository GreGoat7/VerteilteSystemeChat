import { useState, useEffect } from "react";
import axios from "axios";

function useGroupsAndMessages(userId) {
  const [data, setData] = useState({ groups: [], messages: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/api/user/${userId}/groups-with-messages`
        );
        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return { ...data, loading, error };
}

export default useGroupsAndMessages;
