import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

interface ChatMessage {
  username: string;
  text: string;
  timestamp: string;
}

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const usernameSet = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Prompt for username once
  useEffect(() => {
    if (!usernameSet.current) {
      const name = prompt("Enter your username") || "Anonymous";
      setUsername(name);
      usernameSet.current = true;
    }
  }, []);


  useEffect(() => {
  fetch("http://localhost:4000/messages")
    .then((res) => res.json())
    .then((data) => {
      setMessages(data);
    })
    .catch((err) => console.error("Failed to fetch messages:", err));
}, []);

  useEffect(() => {
    const handleMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("chat message", handleMessage);

    return () => {
      socket.off("chat message", handleMessage);
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("chat message", { username: username, text: message });
      setMessage("");
    }
  };


  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Choco Chat</h1>

      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: m.username === username ? "flex-end" : "flex-start",
              backgroundColor:
                m.username === username ? "#d899f1ff" : "#FFFFFF",
            }}
          >
            <div style={styles.username}>
              {m.username}{" "}
              <span style={styles.timestamp}>[{m.timestamp}]</span>
            </div>
            <div>{m.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <button style={styles.button} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}




const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#cd6df3ff",
    padding: "1rem",
  },
  header: {
    marginBottom: "1rem",
  },
  chatBox: {
    display: "flex",
    flexDirection: "column" as const,
    width: "100%",
    maxWidth: "600px",
    height: "70vh",
    backgroundColor: "#eeb4e6ff",
    padding: "1rem",
    overflowY: "auto" as const,
    boxShadow: "0 0 5px rgba(0,0,0,0.2)",
  },
  message: {
    maxWidth: "70%",
    marginBottom: "0.5rem",
    padding: "0.5rem 1rem",
    borderRadius: "10px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  username: {
    fontSize: "0.8rem",
    fontWeight: "bold",
    marginBottom: "0.3rem",
  },
  timestamp: {
    color: "#666",
    fontSize: "0.7rem",
  },
  inputRow: {
    display: "flex",
    marginTop: "1rem",
    width: "100%",
    maxWidth: "600px",
  },
  input: {
    flex: 1,
    padding: "0.5rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    marginLeft: "0.5rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#eeb4e6ff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default App;
