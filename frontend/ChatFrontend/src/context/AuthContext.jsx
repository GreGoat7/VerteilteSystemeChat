import React, { createContext, useContext, useState } from "react";
import axios from "axios";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [username, setUsername] = useState(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null); // Hinzufügen des Tokens
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const register = async (username, password) => {
    try {
      const response = await axios.post("http://localhost:4000/api/register", {
        username,
        password,
      });
      // Eventuell: Setze Zustände basierend auf der Antwort
      console.log("Registrierung erfolgreich", response.data);
    } catch (error) {
      console.error("Registrierungsfehler", error);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post("http://localhost:4000/api/login", {
        username,
        password,
      });
      if (response.data.token) {
        setToken(response.data.token);
        setUsername(username);
        setUserId(response.data.userId);
        setIsLoggedIn(true);
        localStorage.setItem("token", response.data.token);
      }
    } catch (error) {
      console.error("Login-Fehler", error);
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
      value={{ username, userId, token, isLoggedIn, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
