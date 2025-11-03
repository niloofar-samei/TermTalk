import { useEffect, useState } from "react";
import {io} from "socket.io-client";

const socket = io("http://localhost:4000");

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{username: string; text: string}[]>([]);

  // Prompt for username once
  useEffect(() => {
    const username = prompt("Enter your username") || "Anonymous";
    setUsername(username);
  }, []);

  useEffect(() => {
    const handleMessage = (msg: {username: string; text: string}) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("chat message", handleMessage);

    return () => {
      socket.off("chat message", handleMessage);
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("chat message", {username: username, text: message});
      setMessage("");
    }
  };


  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Chat App</h1>
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div>
        {messages.map((m, i) => (
          <p key={i}>
            <b>{m.username}:</b> {m.text}
          </p>
        ))}
      </div>
    </div>
  );
}


export default App;
