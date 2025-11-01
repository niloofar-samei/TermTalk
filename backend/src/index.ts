import express from "express";

const app = express();
const PORT = 4000;

// simple health route
app.get("/", (req, res) => {
  res.send("Hello — backend is up!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
