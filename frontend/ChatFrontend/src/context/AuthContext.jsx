import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [username, setUsername] = useState(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null); // Hinzufügen des Tokens
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state added

  const googleLogin = () => {
    window.location.href = "http://localhost/api/auth/google";
  };
  window.onload = async function () {
    // Get the full URL
    const currentUrl = new URL(window.location.href);

    // Extract the token from the URL parameters
    const token = currentUrl.searchParams.get("token");
    const username = currentUrl.searchParams.get("username");
    const userId = currentUrl.searchParams.get("userId");

    if (token) {
      // Save the token to localStorage
      localStorage.setItem("token", token);
      window.history.pushState({}, "", "home");
      setLoading(true);
      const response = await axios.get("http://localhost/api/authenticate", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setUsername(username);
      setUserId(userId);
      setToken(token);
      setIsLoggedIn(true);
      setLoading(false);
      console.log("reposne", response);
    }
  };

  const register = async (username, password) => {
    try {
      const response = await axios.post("http://localhost/api/register", {
        username,
        password,
      });
      // Eventuell: Setze Zustände basierend auf der Antwort
      console.log("Registrierung erfolgreich", response.data);
    } catch (error) {
      console.error("Registrierungsfehler", error);
    }
  };
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      setLoading(true);
      if (token) {
        try {
          // Send a request to your backend to validate the token
          const response = await axios.get(
            "http://localhost/api/authenticate",
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("hallo");
          // Assuming your backend sends back the username and userId in the response
          setUsername(response.data.username);
          setUserId(response.data.userId);
          setToken(token);
          setIsLoggedIn(true);
          setLoading(false);
        } catch (error) {
          console.error("Token-Validierungsfehler", error);
          logout(); // Optional: clean-up if the token is not valid
        }
      }
    };
    validateToken();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post("http://localhost/api/login", {
        username,
        password,
      });
      console.log("reponse", response);
      if (response.data.token) {
        setToken(response.data.token);
        setUsername(username);
        setUserId(response.data.userId);
        setIsLoggedIn(true);
        localStorage.setItem("token", response.data.token);
      }
    } catch (error) {
      console.error("Login-Fehler", error);
      throw error;
    }
  };

  const logout = () => {
    setUsername(null);
    setUserId(null);
    setToken(null); // Löschen des Tokens
    setIsLoggedIn(false);
    localStorage.removeItem("token"); // Token aus dem localStorage entfernen
  };

  return (
    <AuthContext.Provider
      value={{
        username,
        userId,
        token,
        isLoggedIn,
        loading,
        login,
        logout,
        register,
        googleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
