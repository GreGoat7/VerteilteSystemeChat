import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function Login({}) {
  const [username, setUsername] = useState("");
  const { login } = useAuth();

  function handleLogin(e) {
    e.preventDefault();
    login(username);
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
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
