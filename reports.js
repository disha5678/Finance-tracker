document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("username");
    if (!username) {
        window.location.href = "index.html";
        return;
    }

    setupProfileMenu();
    loadExpenseChart();
});

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

async function loadExpenseChart() {
    const username = localStorage.getItem("username");
    if (!username) {
        console.error("No username found");
        return;
    }

    const response = await fetch(`http://localhost:3001/get_expenses?username=${username}&days=7`);
    const expenses = await response.json();

    const categoryTotals = expenses.reduce((totals, expense) => {
        const category = expense.category.toLowerCase();
        totals[category] = (totals[category] || 0) + parseFloat(expense.amount);
        return totals;
    }, {});

    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);

    const ctx = document.getElementById('expenseChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories.map(category => category.charAt(0).toUpperCase() + category.slice(1)),
            datasets: [{
                data: amounts,
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4CAF50',
                    '#FF9800',
                    '#9C27B0',
                    '#E91E63'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Expense Breakdown (Last 7 Days)'
                }
            }
        }
    });
}