document.addEventListener("DOMContentLoaded", function () {
    // Function to show registration form
    function showRegistrationForm() {
        document.getElementById("registrationForm").style.display = "block";
        document.getElementById("loginForm").style.display = "none";
    }

    // Function to show login form
    function showLoginForm() {
        document.getElementById("registrationForm").style.display = "none";
        document.getElementById("loginForm").style.display = "block";
    }

    // Make functions globally accessible
    window.showRegistrationForm = showRegistrationForm;
    window.showLoginForm = showLoginForm;

    document.querySelector("#registrationForm form").addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevents the form from reloading the page

        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const response = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password }),
        });

        const result = await response.json();
        alert(result.message);

        if (response.ok) {
            localStorage.setItem("username", result.username); 
            showLoginForm(); // Show login form after successful registration
        }
    });

    document.querySelector("#loginForm form").addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try{
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();
        alert(result.message);

        if (response.ok) {
            localStorage.setItem("username", result.username);// Debugging
            window.location.href = "dashboard.html"; // Redirect on successful login
        } 
    }catch(error) {
            console.error("Login failed:", error);
            alert("Login failed. Please check server logs.");
        }
    });
});
