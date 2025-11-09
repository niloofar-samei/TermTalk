import express from "express";
import pool from "./db";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

interface ChatMessage {
  username: string;
  text: string;
  timestamp: string;
}

const app = express();
const server = http.createServer(app);
const PORT = 4000;
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
  methods: ["GET", "POST"],
  credentials: true,
});

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true,
}));
app.use(express.json());

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

socket.on("chat message", async (msg: Omit<ChatMessage, "timestamp">) => {
  const timestamp = new Date().toLocaleTimeString();
  const messageWithTime: ChatMessage = { ...msg, timestamp };

  console.log("💬 Received message:", messageWithTime);

  // Save to PostgreSQL
  try {
    const result = await pool.query(
      "INSERT INTO chat_messages(username, text, timestamp) VALUES($1, $2, $3)",
      [msg.username, msg.text, timestamp]
    );
    console.log("✅ Saved to DB:", result.rows[0]);
  } catch (err) {
    console.error("❌ Failed to save message:", JSON.stringify(err, null, 2));
  }

  // Emit to all clients
  io.emit("chat message", messageWithTime);
});


  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/messages", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT username, text, timestamp FROM chat_messages ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch messages:", err);
    res.status(500).json({ error: String(err) });
  }
});


server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
