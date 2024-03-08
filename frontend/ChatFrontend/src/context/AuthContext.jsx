import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [username, setUsername] = useState(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null); // Hinzufügen des Tokens
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (username, userId, token) => {
    setUsername(username);
    setUserId(userId);
    setToken(token); // Speichern des Tokens
    setIsLoggedIn(true);
    localStorage.setItem("token", token); // Token im localStorage speichern
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
      value={{ username, userId, token, isLoggedIn, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
