import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

function Login({}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); // Passwortfeld bereits hinzugefügt
  const { login } = useAuth();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost/api/login", {
        username,
        password,
      });

      if (response.data.token) {
        // Stellen Sie sicher, dass der Token vorhanden ist
        login(
          response.data.username,
          response.data.userId,
          response.data.token
        );
      } else {
        console.error("Login fehlgeschlagen");
      }
    } catch (error) {
      console.error("Login-Fehler:", error);
    }
  }

  return (
    <div className="login">
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password" // Passwortfeld
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
