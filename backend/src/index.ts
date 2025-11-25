import express from "express";
import pool from "./db";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth";
import { PORT } from "./config";
import { auth } from "./middleware/authMiddleware";

// TypeScript interface to define the message structure
interface ChatMessage {
	username: string;
	text: string;
	timestamp: string;
}

// Create a new Express server
const app = express();

// Wrap Express server so socket.io can work with it
const server = http.createServer(app);

// Initialize socket.io and allow my React frontend to connect. Attach socket.io to the HTTP server so it can handle real-time WebSocket connections.
// cors: {...} sets cors rules which control which websites can talk to my backend.
// methods specifies which HTTP methods are allowed for CORS preflight requests. Socket.io sometimes uses HTTP requests first to establish the connection before switching to WebSocket.
// It only applies to HTTP requests (REST API calls).
// credentiols allows the browser to send cookies or authentication headers with the request.
const io = new Server(server, {
	cors: { origin: "http://localhost:5173",
	methods: ["GET", "POST"],
	credentials: true,
	}
});

//---- Middlewares ----///

// Enable cross-origin requests. It only applies to WebSocket connections.
app.use(cors());

// Allows my server to automatically understand JSON data from the frontend.
app.use(express.json());

app.use(authRoutes);


let onlineUsers = 0;

// Runs everytime a user connects
io.on("connection", (socket) => {
	onlineUsers++;
	console.log("User connected:", socket.id);

	io.emit("online users", onlineUsers);

// Receive message from client without timestamp
// async allows us to use await inside for db operations.
// (msg: Omit<ChatMessage, "timestamp">) means msg has all properties of ChatMessage except timestamp.
socket.on("chat message", async (msg: Omit<ChatMessage, "timestamp">) => {
	const timestamp = new Date().toLocaleTimeString();

	// Combines user message + server timestamp
	// { ...msg, timestamp } uses the spread operator (...) to copy all fields from msg.
	const messageWithTime: ChatMessage = { ...msg, timestamp };

	console.log("💬 Received message:", messageWithTime);

	// Save to PostgreSQL
	try {
		// Here await tells JS to wait for this Promise to finish before going to the next line.
		const result = await pool.query(
			"INSERT INTO chat_messages(sender_id, receiver_id, message, timestamp) VALUES($1, $2, $3)",
			[msg.username, msg.text, timestamp]
		);
		console.log("✅ Saved to DB:", result.rows[0]);
	} catch (err) {
		console.error("❌ Failed to save message:", JSON.stringify(err, null, 2));
	}

	// Emit to all clients
	io.emit("chat message", messageWithTime);
});

	// Runs when a user leaves
	socket.on("disconnect", () => {
		onlineUsers--;
		console.log("User disconnected:", socket.id);
		io.emit("online users", onlineUsers);
	});
});

app.get("/me", auth, (req, res) => {
	res.json({
		message: "Token is valid!!",
		user: req.user, // Comes from middleware
	})
})

// Creates a GET API endpoint for frontend to fetch all messages from database. Sends them in JSON format.
app.get("/messages", async (req, res) => {
	try {
		// Here await tells JS to wait for this Promise to finish before going to the next line.
		const result = await pool.query(
			"SELECT sender_id, receiver_id, message, timestamp FROM chat_messages ORDER BY id ASC"
		);

		// It sends data back to frontend in JSON format
		res.json(result.rows);
	} catch (err) {
		console.error("Failed to fetch messages:", err);
		res.status(500).json({ error: String(err) });
	}
});

// Start the server on port 4000
server.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
