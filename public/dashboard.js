document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("username");
    if (!username) {
        window.location.href = "index.html";
        return;
    }
    
    setupProfileMenu();
    loadDashboard(); // Remove duplicate fetch call
});

function loadDashboard() {
    const username = localStorage.getItem("username");
    if (!username) {
        console.error("No username found");
        return;
    }

    console.log("Loading dashboard for user:", username);

    Promise.all([
        fetch(`http://localhost:3001/get-budget?username=${username}`),
        fetch(`http://localhost:3001/get_expenses?username=${username}`)
    ])
    .then(responses => Promise.all(responses.map(r => r.json())))
    .then(([budgetResponse, expenseResponse]) => {
        console.log("Budget response:", budgetResponse);
        
        if (!budgetResponse.success) {
            throw new Error(budgetResponse.message || "Failed to load budgets");
        }

        const budgets = budgetResponse.data || [];
        const expenses = expenseResponse || [];
        
        const container = document.getElementById("budgetOverviewContainer");
        if (!container) {
            throw new Error("Dashboard container not found");
        }

        // Create category summary
        const categories = {
            food: { allocated: 0, spent: 0 },
            transportation: { allocated: 0, spent: 0 },
            shopping: { allocated: 0, spent: 0 },
            bills: { allocated: 0, spent: 0 },
            entertainment: { allocated: 0, spent: 0 },
            education: { allocated: 0, spent: 0 },
            other: { allocated: 0, spent: 0 }
        };

        // Process budgets
        budgets.forEach(budget => {
            const category = budget.category?.toLowerCase();
            if (category && categories[category]) {
                categories[category].allocated += parseFloat(budget.allocated_amount) || 0;
            }
        });

        // Process expenses
        expenses.forEach(expense => {
            const category = expense.category?.toLowerCase();
            if (category && categories[category]) {
                categories[category].spent += parseFloat(expense.amount) || 0;
            }
        });

        // Create dashboard table
        container.innerHTML = `
            <table class="dashboard-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Budget Amount</th>
                        <th>Spent Amount</th>
                        <th>Remaining</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(categories).map(([category, amounts]) => {
                        const remaining = amounts.allocated - amounts.spent;
                        
                        return `
                            <tr>
                                <td>${category.charAt(0).toUpperCase() + category.slice(1)}</td>
                                <td>₹${amounts.allocated.toFixed(2)}</td>
                                <td>₹${amounts.spent.toFixed(2)}</td>
                                <td>₹${remaining.toFixed(2)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    })
    .catch(error => {
        console.error("Error loading dashboard:", error);
        const container = document.getElementById("budgetOverviewContainer");
        if (container) {
            container.innerHTML = `<p class="error">Error loading dashboard: ${error.message}</p>`;
        }
    });
}

function setupProfileMenu() {
    const username = localStorage.getItem('username');
    if (!username) {
        return;
    }

    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = username;
    }

    const profileImg = document.getElementById('profileImg');
    const profileMenu = document.getElementById('profileMenu');
    
    if (profileImg && profileMenu) {
        profileImg.addEventListener('click', (e) => {
            e.stopPropagation();
            profileMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', () => {
            profileMenu.classList.add('hidden');
        });
    }
}

function logout() {
    localStorage.removeItem("username");
    window.location.href = "index.html";
}
function addExpense(category, amount) {
    const username = localStorage.getItem("username"); // ✅ Use username

    fetch("http://localhost:3001/add-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, amount, username }) // ✅ Correct field
    })
    .then(response => response.json())
    .then(data => {
        console.log("✅ Expense added:", data);
        loadDashboard();  // ✅ Refresh dashboard after adding an expense
    })
    .catch(error => console.error("❌ Error adding expense:", error));
}

async function loadExpenses() {
    const username = localStorage.getItem("username");

    const response = await fetch(`http://localhost:3001/get_expenses?username=${username}`);
    const expenses = await response.json();

    // Render expenses on the dashboard
    console.log(expenses);
}

async function loadBudget() {
    const username = localStorage.getItem("username");

    const response = await fetch(`http://localhost:3001/get_budget?username=${username}`);
    const budget = await response.json();

    // Render budget on the dashboard
    console.log(budget);
}
