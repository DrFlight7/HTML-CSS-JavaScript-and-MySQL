const express = require("express");
const bodyParser = require("body-parser");
const mariadb = require("mariadb");
const app = express();
const port = 3000;

// Database pool connection
const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "your_database",
  connectionLimit: 5,
});

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));

// Helper function to convert BigInt to string
const convertBigIntToString = (obj) => {
  for (let prop in obj) {
    if (typeof obj[prop] === 'bigint') {
      obj[prop] = obj[prop].toString();
    } else if (typeof obj[prop] === 'object' && obj[prop] !== null) {
      convertBigIntToString(obj[prop]);
    }
  }
  return obj;
};

// Route to get all users
app.get("/users", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM users");
    // Convert BigInt to string before sending
    const serializedRows = rows.map(row => convertBigIntToString(row));
    res.json(serializedRows);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ error: `Database error: ${err.message}` });
  } finally {
    if (conn) conn.release();
  }
});

// Route to add a user
app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      "INSERT INTO users(name, email) VALUES(?, ?)",
      [name, email]
    );
    // Convert BigInt to string before sending
    const serializedResult = convertBigIntToString(result);
    res.json({ id: serializedResult.insertId, name, email });
  } catch (err) {
    console.error("Error inserting user:", err.message);
    res.status(500).json({ error: `Database error: ${err.message}` });
  } finally {
    if (conn) conn.release();
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});