document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("username");
    if (!username) {
        window.location.href = "index.html";
        return;
    }
    
    loadBudget();
    setupEventListeners();
});

function setupEventListeners() {
    const addBudgetBtn = document.getElementById("addBudgetBtn");
    if (addBudgetBtn) {
        addBudgetBtn.addEventListener("click", showBudgetForm);
    }

    const saveBtn = document.getElementById("saveBtn");
    if (saveBtn) {
        saveBtn.addEventListener("click", saveBudget);
    }

    const cancelBtn = document.getElementById("cancelBtn");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", closeForm);
    }

    const categories = ["food", "transportation", "shopping", "bills", "entertainment", "education", "other"];
    categories.forEach(category => {
        const input = document.getElementById(category);
        if (input) {
            input.addEventListener('input', updateTotalAllocation);
        }
    });
}

function updateTotalAllocation() {
    const categories = ["food", "transportation", "shopping", "bills", "entertainment", "education", "other"];
    let total = 0;
    
    categories.forEach(category => {
        const value = parseFloat(document.getElementById(category).value) || 0;
        total += value;
    });
    
    const totalElement = document.getElementById("totalAllocation");
    if (totalElement) {
        totalElement.textContent = total.toFixed(2);
        totalElement.style.color = Math.abs(total - 100) < 0.01 ? 'green' : 'red';
    }
}

function showBudgetForm() {
    // Reset form fields
    document.getElementById("name").value = "";
    document.getElementById("income").value = "";
    document.getElementById("start_date").value = "";
    document.getElementById("end_date").value = "";
    
    const categories = ["food", "transportation", "shopping", "bills", "entertainment", "education", "other"];
    categories.forEach(category => {
        document.getElementById(category).value = "";
    });

    // Show form
    document.getElementById("budgetForm").classList.remove("hidden");
}

function saveBudget() {
    const username = localStorage.getItem("username");
    if (!username) {
        alert("Please log in first!");
        return;
    }
    const name = document.getElementById("name").value;
    const income = parseFloat(document.getElementById("income").value);
    const startDate = document.getElementById("start_date").value;
    const endDate = document.getElementById("end_date").value;

    if (!name || !income || !startDate || !endDate) {
        alert("Please fill all required fields!");
        return;
    }

    const categories = ["food", "transportation", "shopping", "bills", "entertainment", "education", "other"];
    let totalPercentage = 0;
    const allocations = [];

    // Calculate total percentage and create allocations
    categories.forEach(category => {
        const percentage = parseFloat(document.getElementById(category).value) || 0;
        totalPercentage += percentage;
        const amount = (income * percentage) / 100;
        
        // Add all categories to allocations, even if percentage is 0
        allocations.push({
            category: category,
            allocated_amount: amount
        });
    });

    // Validate total percentage
    if (Math.abs(totalPercentage - 100) > 0.01) {
        alert("Total percentage must equal 100%!");
        return;
    }

    const budgetData = {
        username: username,
        name: name,
        total_amount: income,
        start_date: startDate,
        end_date: endDate,
        allocations: allocations
    };

    console.log("Sending budget data:", budgetData); // Debug log

    fetch("http://localhost:3001/add-budget", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json"
        },
        body: JSON.stringify(budgetData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || `Server error: ${response.status}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert("Budget created successfully!");
            document.getElementById("budgetForm").classList.add("hidden");
            loadBudget(); // Refresh the budget table
        } else {
            throw new Error(data.message || "Failed to create budget");
        }
    })
    .catch(error => {
        console.error("Error saving budget:", error);
        alert(`Failed to save budget: ${error.message}`);
    });
}

function loadBudget() {
    const username = localStorage.getItem("username");
    if (!username) {
        console.error("No username found");
        window.location.href = "index.html";
        return;
    }

    fetch(`http://localhost:3001/get-budget?username=${username}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || `Server error: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(response => {
            if (!response.success) {
                throw new Error(response.message || "Failed to load budgets");
            }
            const groupedBudgets = groupBudgetsByPeriod(response.data);
            updateBudgetTable(groupedBudgets);
        })
        .catch(error => {
            console.error("Error loading budget:", error);
            showErrorInTable(error.message);
        });
}

function updateBudgetTable(data) {
    const tbody = document.getElementById("budgetTable").getElementsByTagName("tbody")[0];
    if (!tbody) {
        throw new Error("Budget table body not found!");
    }
    tbody.innerHTML = "";

    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center;">No budgets found</td>
            </tr>`;
        return;
    }
    data.forEach(budget => {
        const row = tbody.insertRow();
        row.innerHTML = createBudgetRow(budget);
    });

    // Group budgets by ID and date range
    // const budgetGroups = groupBudgetsByPeriod(data);

    // // Create table rows
    // Object.values(budgetGroups).forEach(budget => {
    //     const row = tbody.insertRow();
    //     row.innerHTML = createBudgetRow(budget);
    // });
}

function groupBudgetsByPeriod(data) {
    const budgetGroups = {};
    data.forEach(budget => {
        const key = `${budget.start_date}-${budget.end_date}`;
        if (!budgetGroups[key]) {
            budgetGroups[key] = {
                start_date: budget.start_date,
                end_date: budget.end_date,
                total_amount: 0,
                categories: {
                    food: 0,
                    transportation: 0,
                    shopping: 0,
                    bills: 0,
                    entertainment: 0,
                    education: 0,
                    other: 0
                }
            };
        }
        budgetGroups[key].categories[budget.category.toLowerCase()] = parseFloat(budget.allocated_amount) || 0;
        budgetGroups[key].total_amount += parseFloat(budget.allocated_amount) || 0;
    });
    return Object.values(budgetGroups);
}

function createBudgetRow(budget) {
    return `
        <td>${new Date(budget.start_date).toLocaleDateString()}</td>
        <td>${new Date(budget.end_date).toLocaleDateString()}</td>
        <td>₹${budget.total_amount.toFixed(2)}</td>
        <td>₹${budget.categories.food.toFixed(2)}</td>
        <td>₹${budget.categories.transportation.toFixed(2)}</td>
        <td>₹${budget.categories.shopping.toFixed(2)}</td>
        <td>₹${budget.categories.bills.toFixed(2)}</td>
        <td>₹${budget.categories.entertainment.toFixed(2)}</td>
        <td>₹${budget.categories.education.toFixed(2)}</td>
        <td>₹${budget.categories.other.toFixed(2)}</td>
        <td>
            <button onclick="editBudget('${budget.id}')" class="edit-btn">Edit</button>
            <button onclick="deleteBudget('${budget.id}')" class="delete-btn">Delete</button>
        </td>
    `;
}

function showErrorInTable(message) {
    const tbody = document.getElementById("budgetTable").getElementsByTagName("tbody")[0];
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; color: red;">
                    Error loading budgets: ${message}
                </td>
            </tr>`;
    }
}

function editBudget(budgetId) {
    const username = localStorage.getItem("username");
    if (!username) {
        alert("User not logged in!");
        return;
    }

    fetch(`http://localhost:3001/get-budget/${budgetId}?username=${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(budget => {
            populateForm(budget);
            document.getElementById("budgetForm").classList.remove("hidden");
            document.getElementById("saveBtn").setAttribute("data-edit-id", budgetId);
        })
        .catch(error => {
            console.error("Error loading budget for edit:", error);
            alert("Failed to load budget for editing. Please try again.");
        });
}

function populateForm(budget) {
    document.getElementById("income").value = budget.total_amount;
    document.getElementById("start_date").value = budget.start_date;
    document.getElementById("end_date").value = budget.end_date;
    
    Object.entries(budget.categories).forEach(([category, amount]) => {
        const percentage = (amount / budget.total_amount) * 100;
        document.getElementById(category).value = percentage.toFixed(2);
    });
}

function deleteBudget(budgetId) {
    if (!budgetId || !confirm("Are you sure you want to delete this budget?")) {
        return;
    }

    const username = localStorage.getItem("username");
    if (!username) {
        console.error("No username found");
        return;
    }

    fetch(`http://localhost:3001/delete-budget/${budgetId}?username=${username}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || `Server error: ${response.status}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert("Budget deleted successfully!");
            loadBudget();
        } else {
            throw new Error(data.message || "Failed to delete budget");
        }
    })
    .catch(error => {
        console.error("Error deleting budget:", error);
        alert(`Failed to delete budget: ${error.message}`);
    });
}

function closeForm() {
    document.getElementById("budgetForm").classList.add("hidden");
    document.getElementById("saveBtn").removeAttribute("data-edit-id");
}