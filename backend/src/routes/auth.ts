import { Router } from "express";
import pool from "../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

const JWT_SECRET = "asus";

// Register endpoint
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  try{
    const result = await pool.query("INSERT INTO users(username, password_hash) VALUES($1, $2) RETURNING id, username", [username, hashed]);
    res.json({user: result.rows[0]});
  } catch (err) {
    res.status(400).json({error: "Could not insert into db."});
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE username=$1", [username]);

  if (result.rows.length === 0) return res.status(401).json({ error:"Invalid username or password" });

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password_hash);

  if (!match) return res.status(401).json({ error: "Invalid username or password" });

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token });
});

export default router;
