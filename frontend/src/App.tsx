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
  const [input, setInput] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // update every second

    // cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);
  
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
    <div className="flex flex-col h-screen bg-stone-900 text-terminal-primary font-mono p-4">
      {/* Header */}
      <header className="mb-4">
        <h1 className="text-xl text-terminal-secondary glow">
          hello.sh — connected
        </h1>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg, idx) => (
          <p
            key={idx}
            className={
              msg.username === username
                ? "text-indigo-500"
                : "text-green-400"
            }
          >
            [{msg.username}] {msg.username === username ? ">" : "<"} {msg.text} - <i className="text-sm">{msg.timestamp}</i>
          </p>
        ))}
      </main>

      <div className="flex items-center text-lime-500">
        <span className="text-terminal-accent mr-2">{">"}</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="[Home]~$ Type a command..."
          className="flex-1 bg-transparent outline-none text-terminal-primary placeholder-terminal-secondary"
        />
        <span className="ml-1 animate-pulse text-terminal-accent">▮</span>
      </div>

      <div className="bg-lime-500 mt-4">{currentTime.toLocaleString()}</div>

    </div>
  );





/*
  return (
    <div className="flex flex-col items-center h-screen bg-gray-900 text-green-400 font-mono p-4">
      <h1 className="text-3xl font-bold mb-4 text-green-500 select-none">TermTalk</h1>

      <div className="flex flex-col w-full max-w-2xl h-[70vh] bg-black border border-green-500 rounded-lg shadow-[0_0_10px_#22c55e] p-4 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 p-2 rounded-lg max-w-[70%] ${
              m.username === username
                ? "self-end bg-green-900 text-green-200"
                : "self-start bg-gray-800 text-green-400"
            }`}
          >
            <div className="text-xs font-bold opacity-70">
              {m.username} <span className="text-gray-500">[{m.timestamp}]</span>
            </div>
            <div>{m.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex w-full max-w-2xl mt-4">
        <input
          className="flex-1 bg-black border border-green-500 text-green-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
        />
        <button
          className="ml-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-black font-bold rounded-md shadow-[0_0_10px_#22c55e]"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
*/
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
