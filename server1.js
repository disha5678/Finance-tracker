const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

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

// ✅ API to Add Budget
// Update the add-budget endpoint

// Replace the existing add-budget endpoint with this:
app.post("/add-budget", (req, res) => {
    const { username, name, total_amount, start_date, end_date, allocations } = req.body;
    
    console.log("Received budget data:", req.body);

    if (!username || !name || !total_amount || !start_date || !end_date || !allocations) {
        return res.status(400).json({ 
            success: false,
            message: "Missing required fields"
        });
    }

    // Create values for bulk insert
    const values = allocations.map(allocation => [
        username,
        name,
        allocation.category,
        allocation.allocated_amount,
        start_date,
        end_date
    ]);

    const query = `
        INSERT INTO budgets 
        (username,name, category, allocated_amount, start_date, end_date) 
        VALUES ?`;

    db.query(query, [values], (err, result) => {
        if (err) {
            console.error("Error adding budget:", err);
            return res.status(500).json({ 
                success: false,
                message: "Error adding budget"
            });
        }

        console.log("Budget added successfully:", result);
        res.json({ 
            success: true,
            message: "Budget added successfully!" 
        });
    });
});

app.get("/get-budget", (req, res) => {
    const username = req.query.username;
    console.log("Fetching budget for username:", username);

    if (!username) {
        return res.status(400).json({ 
            success: false, 
            message: "Username is required" 
        });
    }

    const query = `
        SELECT id, username, category, allocated_amount, 
               DATE_FORMAT(start_date, '%Y-%m-%d') as start_date, 
               DATE_FORMAT(end_date, '%Y-%m-%d') as end_date
        FROM budgets 
        WHERE username = ?
        ORDER BY start_date DESC`;

    db.query(query, [username], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error fetching budget" 
            });
        }

        console.log("Query results:", results);
        res.json({
            success: true,
            data: results || []
        });
    });
});

app.delete("/delete-budget/:id", (req, res) => {
    const budgetId = req.params.id;
    const username = req.query.username; // Add username parameter
    
    console.log("Delete request for budget:", budgetId, "username:", username);

    // Delete all budget entries with this ID
    const query = "DELETE FROM budgets WHERE id = ? AND username = ?";
    db.query(query, [budgetId, username], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to delete budget"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Budget not found or unauthorized"
            });
        }

        console.log("Budget deleted successfully. Affected rows:", result.affectedRows);
        res.json({
            success: true,
            message: "Budget deleted successfully"
        });
    });
});

app.put("/update-budget/:id", (req, res) => {
    const { name, income, startDate, endDate, budgetAllocations } = req.body;
    const budgetId = req.params.id;

    // Delete existing allocations
    db.query("DELETE FROM budgets WHERE id = ?", [budgetId], (err) => {
        if (err) return res.status(500).json({ message: "Error updating budget" });

        // Insert updated allocations
        const values = Object.entries(budgetAllocations).map(([category, amount]) => 
            [req.body.username, category, amount, startDate, endDate, name]
        );

        const query = "INSERT INTO budgets (username, category, allocated_amount, start_date, end_date, name) VALUES ?";
        db.query(query, [values], (err) => {
            if (err) return res.status(500).json({ message: "Error updating budget" });
            res.json({ message: "Budget updated successfully" });
        });
    });
});

// ✅ API to Add Expense
app.post("/add-expense", (req, res) => {
    const { username, category, amount, date, description } = req.body;
    if (!username || !category || !amount || !date || !description) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const query = "INSERT INTO expenses (username, category, amount, descrip) VALUES (?, ?, ?, ?)";
    db.query(query, [username, category, amount, description], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error adding expense" });
        }
        res.json({ message: "Expense added successfully!" });
    });
});



// Change from get-expenses to get_expenses to match the client request
// app.get("/get_expenses", (req, res) => {
//     const {username} = req.query.username;
    
//     console.log("Fetching expenses for user:", username); // Debug log

//     const query = "SELECT * FROM expenses WHERE username = ? ORDER BY date DESC";
//     db.query(query, [username], (err, results) => {
//         if (err) {
//             console.error("Error fetching expenses:", err);
//             return res.status(500).json({ message: "Error fetching expenses" });
//         }
//         console.log("Found expenses:", results); // Debug log
//         res.json(results);
//     });
// });
// // ✅ API to Fetch Dashboard Data
// app.get("/dashboard", (req, res) => {
//     const username = req.query.username;

//     const query = `
//         SELECT b.category, b.allocated_amount, 
//                IFNULL(SUM(e.amount), 0) AS spent_amount, 
//                (b.allocated_amount - IFNULL(SUM(e.amount), 0)) AS remaining_amount 
//         FROM budgets b 
//         LEFT JOIN expenses e ON b.category = e.category AND e.username = ? 
//         WHERE b.username = ? 
//         GROUP BY b.category, b.allocated_amount`;

//     db.query(query, [username, username], (err, results) => {
//         if (err) {
//             console.error("Error fetching dashboard data:", err);
//             return res.status(500).json({ message: "Server error" });
//         } else {
//             res.json(results);
//         }
//     });
// });


app.get("/get_expenses", (req, res) => {
    const { username, days } = req.query;
    
    console.log("Fetching expenses for user:", username, "for the last", days, "days"); // Debug log

    let query = "SELECT * FROM expenses WHERE username = ?";
    const params = [username];

    if (days) {
        query += " AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)";
        params.push(parseInt(days));
    }

    query += " ORDER BY date DESC";

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("Error fetching expenses:", err);
            return res.status(500).json({ message: "Error fetching expenses" });
        }
        console.log("Found expenses:", results); // Debug log
        res.json(results);
    });
});
// ✅ Start the Server
app.listen(3001, () => {
    console.log("🚀 Server running on http://localhost:3001");
});
