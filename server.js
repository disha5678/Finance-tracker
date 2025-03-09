const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12101977",
    database: "expense_tracker",
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL database");
});

// ✅ API to Register User (Includes email)
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", 
            [username, email, hashedPassword], 
            (err) => {
                if (err) {
                    console.error("Error registering user:", err.sqlMessage);
                    return res.status(500).json({ message: "Error registering user", error: err.sqlMessage });
                }
                res.json({ message: "User registered successfully!" });
            }
        );
    } catch (error) {
        console.error("Error hashing password:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ API to Login User (Only Username & Password)
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
        if (err) {
            console.error("Error logging in:", err);
            return res.status(500).json({ message: "Server error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "User not found!" });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Incorrect password!" });
        }

        res.json({ message: "Login successful!", username: user.username });
    });
});

// ✅ Start the Server
app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});
