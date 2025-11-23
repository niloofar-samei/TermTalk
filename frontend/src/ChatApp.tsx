import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

// TypeScript interface for a chat message
interface ChatMessage {
  username: string;
  text: string;
  timestamp: string;
}

/**
 * Props expected by ChatApp component.
 */
interface ChatAppProps {
	token: string;  //JWT token for authenticated API requests
}

/**
 * Create a Socket.IO client connection to the backend server.
 * This handles real-time communication for chat messages.
 */
const socket = io("http://localhost:4000");

/**
 * ChatApp component
 * 
 * Handles:
 *  - Rendering chat messages UI
 *  - Sending new messages
 *  - Real-time updates via Socket.IO connection
 *  - Displaying online users
 *  - Fetching old messages from the backend using JWT token
 */
function ChatApp({ token }: ChatAppProps) {


  // ---------------------------
  // React state variables
  // ---------------------------
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Ref to ensure username prompt shows only once
  const usernameSet = useRef(false);	
  // Ref for scrolling to latest message
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [onlineUsers, setOnlineUsers] = useState(0);

  // ---------------------------
  // Listen for online users count updates
  // ---------------------------
  useEffect(() => {
	socket.on("online users", (count: number) => {
	  setOnlineUsers(count);
	});

	// Cleanup lister on unmount
	return () => {
	  socket.off("online users");
	};
  }, []);

  // ---------------------------
  // Update current time every second
  // ---------------------------
  useEffect(() => {
	const interval = setInterval(() => {
	  setCurrentTime(new Date());
	}, 1000); // update every second

	// cleanup interval on unmount
	return () => clearInterval(interval);
  }, []);
  
  // ---------------------------
  // Prompt the user for a username once
  // ---------------------------
  useEffect(() => {
	if (!usernameSet.current) {
	  const name = prompt("Enter your username") || "Anonymous";
	  setUsername(name);
	  usernameSet.current = true;
	}
  }, []);

  // ---------------------------
  // Fetch old chat messages from backend
  // ---------------------------
  useEffect(() => {
	fetch("http://localhost:4000/messages", {
	  headers: {
		// Send JWT toke in Authorization header
		Authorization: `Bearer ${token}`,
	  },
	})
	  .then((response) => response.json())
	  .then((data) => {
		setMessages(data);
	  })
	  .catch((err) => console.error("Failed to fetch messages:", err));
}, [token]); // Add token as dependency in case it changes

  // ---------------------------
  // Listen for new incoming chat messages via Socket.IO and andd them to the current messages
  // ---------------------------
  useEffect(() => {
	const handleMessage = (msg: ChatMessage) => {
	  setMessages((prev) => [...prev, msg]);
	};

	socket.on("chat message", handleMessage);

	// Cleanup listener on unmount
	return () => {
	  socket.off("chat message", handleMessage);
	};
  }, []);

  // ---------------------------
  // Send a new chat message to the backend
  // ---------------------------
  const sendMessage = () => {
	if (input.trim()) {
	  socket.emit("chat message", { username: username, text: input });
	  setInput("");
	}
  };

  // ---------------------------
  // JSX rendering
  // ---------------------------
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
		<div ref={messagesEndRef} />
	  </main>

	  {/* Footer */}
	  <footer className="flex items-center text-lime-500">
		<span className="text-terminal-accent mr-2">{">"}</span>
		<input
		  value={input}
		  onChange={(e) => setInput(e.target.value)}
		  onKeyDown={(e) => {
			if (e.key === "Enter") {
			  sendMessage();
			}
		  }}
		  placeholder="[Home]~$ Type a command..."
		  className="flex-1 bg-transparent outline-none text-terminal-primary placeholder-terminal-secondary"
		/>
		<span className="ml-1 animate-pulse text-terminal-accent">▮</span>
	  </footer>

	  <div className="bg-lime-500 mt-4 pl-2">{
		currentTime.toLocaleString()} ~ Online users: {onlineUsers}
	  </div>
	</div>
  );
}

// Make the App component available to App.tsx file.
export default ChatApp;
