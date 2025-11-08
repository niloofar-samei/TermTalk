// src/db-test.ts
import pool from "./db";

async function testDB() {
  try {
    const res = await pool.query("SELECT NOW()"); // simple query to test
    console.log("Database connected! Current time:", res.rows[0]);
  } catch (err) {
    console.error("Database connection failed:", err);
  } finally {
    await pool.end(); // close the connection pool
  }
}

testDB();
