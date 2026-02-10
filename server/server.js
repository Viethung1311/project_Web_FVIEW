const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "change_me_to_a_long_random_secret";

// ====== DB ======
const db = new sqlite3.Database("./app.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Test root
app.get("/", (req, res) => {
  res.send("OK - Server is running");
});

// ====== REGISTER ======
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "Thiếu dữ liệu" });

    if (password.length < 6)
      return res.status(400).json({ message: "Mật khẩu tối thiểu 6 ký tự" });

    const exists = await get(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );
    if (exists)
      return res.status(409).json({ message: "User hoặc email đã tồn tại" });

    const password_hash = await bcrypt.hash(password, 10);
    const created_at = new Date().toISOString();

    await run(
      "INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
      [username, email, password_hash, created_at]
    );

    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (e) {
    res.status(500).json({ message: "Lỗi server", error: String(e) });
  }
});

// ====== LOGIN ======
app.post("/api/login", async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password)
      return res.status(400).json({ message: "Thiếu dữ liệu" });

    const user = await get(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [usernameOrEmail, usernameOrEmail]
    );
    if (!user)
      return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok)
      return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });

    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (e) {
    res.status(500).json({ message: "Lỗi server", error: String(e) });
  }
});

// ====== AUTH ======
function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Thiếu token" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Token không hợp lệ/đã hết hạn" });
  }
}

// ====== ME ======
app.get("/api/me", auth, async (req, res) => {
  const user = await get(
    "SELECT id, username, email, created_at FROM users WHERE id = ?",
    [req.user.userId]
  );
  res.json({ user });
});

app.listen(3000, () => {
  console.log("Server running http://localhost:3000");
});
