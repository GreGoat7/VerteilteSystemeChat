import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

// Verbinden mit dem Backend-Server
const socket = io("http://localhost:4000"); // Stellen Sie sicher, dass die URL und der Port mit Ihrem Backend-Server übereinstimmen

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on("chat message", (msg) => {
      setChat([...chat, msg]);
    });

    // Cleanup beim Unmount
    return () => socket.off("chat message");
  }, [chat]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message !== "") {
      socket.emit("chat message", message);
      setMessage("");
    }
  };

  return (
    <div className="App">
      <h1>Chat</h1>
      <ul id="messages">
        {chat.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <form onSubmit={sendMessage}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nachricht eingeben"
        />
        <button type="submit">Senden</button>
      </form>
    </div>
  );
}

export default App;
