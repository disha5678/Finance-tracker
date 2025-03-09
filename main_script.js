document.addEventListener("DOMContentLoaded", () => {
    console.log("Loading expenses...");
    const username = localStorage.getItem("username");
    if (!username) {
        console.log("No user logged in");
        return;
    }
    loadExpenses();  // ✅ Fetch stored expenses on page load

    const table = document.getElementById("expenseTableBody");
    console.log("Expense table body element:", table);
});

// ✅ Show Add Expense Form
document.getElementById("addExpenseBtn").addEventListener("click", function () {
    document.getElementById("expenseForm").style.display = "block";
});

// ✅ Close Expense Form
function closeForm() {
    document.getElementById("expenseForm").style.display = "none";
}

// ✅ Function to Add Expense to Database
function addExpense() {
    const username = localStorage.getItem("username"); // ✅ Get logged-in user
    if (!username) {
        alert("User not logged in!");
        return;
    }

    let date = document.getElementById("date").value;
    let category = document.getElementById("category").value;
    let amount = parseFloat(document.getElementById("amount").value);
    let description = document.getElementById("description").value;

        // Debug log
        console.log("Sending expense data:", {
            username, category, amount, date, description
        });

    if (!date || !category || !amount || !description) {
        alert("Please fill all fields!");
        return;
    }

    // ✅ Send Expense Data to Server
    fetch("http://localhost:3001/add-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, category, amount, date, description })
    })
    .then(response => response.json())
    // .then(data => {
    //     alert(data.message);
    //     closeForm();
    //     loadExpenses();  // ✅ Refresh expenses after adding new one
    // })
    .then(data => {
        // if (data.message === "Expense added successfully!") {
        //     alert("Expense added successfully!");
        //     document.getElementById("expenseForm").classList.add("hidden");
        //     loadExpenses();  // Refresh the expense list
        // } else {
        //     alert(data.message);
        // }
        if (data.message === "Expense added successfully!") {
            alert("Expense added successfully!");
            document.getElementById("expenseForm").style.display = "none"; // Changed from classList
            document.getElementById("date").value = "";
            document.getElementById("category").selectedIndex = 0;
            document.getElementById("amount").value = "";
            document.getElementById("description").value = "";
            loadExpenses();
            loadDashboard(); // Reload the expenses table
        } else {
            alert(data.message);
        }
    }) 
    .catch(error => console.error("❌ Error adding expense:", error));

}

// ✅ Function to Fetch and Display Expenses
// function loadExpenses() {
//     const username = localStorage.getItem("username");
//     if (!username) return;

//     fetch(`http://localhost:3001/get-expenses?username=${username}`)
//         .then(response => response.json())
//         .then(data => {
//             console.log("Received expenses:", data); // Debug log
//             const table = document.getElementById("expenseTableBody");
//             if (!table) {
//                 console.error("Table body not found!");
//                 return;
//             }
//             table.innerHTML = "";  // ✅ Clear old data

//             data.forEach(expense => {
//                 let row = table.insertRow();
//                 row.innerHTML = `
//                     <td>${new Date(expense.date).toLocaleDateString()}</td>
//                     <td>${expense.category}</td>
//                     <td>₹${parseFloat(expense.amount).toFixed(2)}</td>
//                     <td>${expense.description}</td>
//                     <td><button class="delete-btn" onclick="deleteExpense(${expense.id})">Delete</button></td>
//                 `;
//             });
//             if (data.length === 0) {
//                 table.innerHTML = `
//                     <tr>
//                         <td colspan="5" style="text-align: center;">No expenses found</td>
//                     </tr>`;
//             }
//         })
//         .catch(error => {
//             console.error("Error fetching expenses:", error);
//             const table = document.getElementById("expenseTableBody");
//             table.innerHTML = `
//                 <tr>
//                     <td colspan="5" style="text-align: center; color: red;">Error loading expenses</td>
//                 </tr>`;
//         });
// }

function loadExpenses() {
    const username = localStorage.getItem("username");
    if (!username) {
        console.log("No username found in localStorage");
        return;
    }

    console.log("Fetching expenses for user:", username); // Debug log

    fetch(`http://localhost:3001/get_expenses?username=${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Received expenses:", data); // Debug log
            const table = document.getElementById("expenseTableBody");
            if (!table) {
                console.error("Table body not found!");
                return;
            }
            table.innerHTML = "";

            if (data && data.length > 0) {
                data.forEach(expense => {
                    let row = table.insertRow();
                    row.innerHTML = `
                        <td>${new Date(expense.date).toLocaleDateString()}</td>
                        <td>${expense.category}</td>
                        <td>₹${parseFloat(expense.amount).toFixed(2)}</td>
                        <td>${expense.descrip}</td>
                        <td><button class="delete-btn" onclick="deleteExpense(${expense.id})">Delete</button></td>
                    `;
                });
            } else {
                table.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center;">No expenses found</td>
                    </tr>`;
            }
        })
        .catch(error => {
            console.error("Error loading expenses:", error);
            const table = document.getElementById("expenseTableBody");
            if (table) {
                table.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; color: red;">
                            Error loading expenses. Please try again.
                        </td>
                    </tr>`;
            }
        });
}

// ✅ Function to Delete Expense from Database
function deleteExpense(expenseId) {
    fetch(`http://localhost:3001/delete-expense?id=${expenseId}`, { method: "DELETE" })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadExpenses();  // ✅ Refresh table after deletion
        })
        .catch(error => console.error("❌ Error deleting expense:", error));
}
