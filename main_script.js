document.getElementById("addExpenseBtn").addEventListener("click", function () {
    document.getElementById("expenseForm").style.display = "block";
});

// Function to close the form
function closeForm() {
    document.getElementById("expenseForm").style.display = "none";
}

// Function to add a new expense
function addExpense() {
    let date = document.getElementById("date").value;
    let category = document.getElementById("category").value;
    let amount = document.getElementById("amount").value;
    let description = document.getElementById("description").value;

    if (date === "" || category === "" || amount === "" || description === "") {
        alert("Please fill all fields!");
        return;
    }

    let table = document.getElementById("expenseTableBody");

    let row = table.insertRow();
    row.innerHTML = `
        <td>${date}</td>
        <td>${category}</td>
        <td>₹${parseFloat(amount).toFixed(2)}</td>
        <td>${description}</td>
        <td><button class="delete-btn" onclick="deleteExpense(this)">Delete</button></td>
    `;
    table.appendChild(row);

    // Clear the input fields
    document.getElementById("date").value = "";
    document.getElementById("category").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("description").value = "";

    closeForm();
}

// Function to delete an expense
function deleteExpense(button) {
    let row = button.parentElement.parentElement;
    row.remove();
}
