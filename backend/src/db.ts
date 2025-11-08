import { Pool } from "pg";

const pool = new Pool({
  user: "dbuser",
  host: process.env.PGHOST || "./db",
  database: "termtalk",
  password: "11223344",
  port: Number(process.env.PGPORT) || 5432,
});

export default pool;
