import { Router } from "express";
import pool from "../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

const router = Router();

/**
 * -------------------------------------------------------------
 *  POST /register
 *  Register a new user
 * -------------------------------------------------------------
 * Expected request body:
 *   {
 *     "username": "example",
 *     "password": "secret123"
 *   }
 *
 * Process:
 * 1. Hash the password with bcrypt
 * 2. Insert user into the database
 * 3. Return the newly created user (id + username)
 *
 * Possible responses:
 * 200 OK   → { user: { id, username } }
 * 400 Bad Request → { error: "Could not insert into db." }
 */router.post("/register", async (req, res) => {
  const { username, password } = req.body;
	// Hash password with saltRounds = 10
  const hashed = await bcrypt.hash(password, 10);

  try{
	// Insert user and return basic info
	const result = await pool.query("INSERT INTO users(username, password_hash) VALUES($1, $2) RETURNING id, username", [username, hashed]);
	res.json({user: result.rows[0]});
  } catch (err) {
	res.status(400).json({error: "Could not insert into db."});
  }
});

/**
 * -------------------------------------------------------------
 *  POST /login
 *  Authenticate an existing user
 * -------------------------------------------------------------
 * Expected request body:
 *   {
 *     "username": "example",
 *     "password": "secret123"
 *   }
 *
 * Process:
 * 1. Look up the user by username
 * 2. Compare passwords using bcrypt
 * 3. If match → sign a JWT token containing user ID + username
 *
 * JWT token payload example:
 *   {
 *     id: 3,
 *     username: "john"
 *   }
 *
 * Possible responses:
 * 200 OK   → { token: "jwt-token-here" }
 * 401 Unauthorized → { error: "Invalid username or password" }
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  // Find user in database
  const result = await pool.query("SELECT * FROM users WHERE username=$1", [username]);

  if (result.rows.length === 0) return res.status(401).json({ error:"Invalid username or password" });

  const user = result.rows[0];
	// Compare supplied password with stored hashed password
  const match = await bcrypt.compare(password, user.password_hash);

  if (!match) return res.status(401).json({ error: "Invalid username or password" });

  // If valid → generate JWT token
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1d" }); // Token valid for 1 day
  // Return user info as well as JWT 
  res.json({ token, user: { id: user.id, username: user.username,}, });
});

export default router;
