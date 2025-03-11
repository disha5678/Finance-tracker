# Finance Tracker

A web-based application to manage personal finances by tracking income, expenses, and budgets. Built with **Node.js, Express, MySQL**, and a frontend using **HTML, CSS, and JavaScript**.

## Features
- **User Authentication:** Secure registration and login using **bcrypt** for password hashing.
- **Manage Budget:** Allocate a budget for different expense categories.
- **Track Expenses:** Add and categorize expenses for better financial insights.
- **Dashboard Overview:** View total budget, expenses per category, and remaining balance.
- **Data Persistence:** Budget and expenses are stored in MySQL and retrieved per user.

## Project Structure
```
finance-tracker/
│── public/               # Frontend files (HTML, CSS, JS)
│── routes/               # Express route handlers
│── models/               # Database models
│── server.js             # Handles authentication (login & register)
│── server1.js            # Manages budget, expenses, and dashboard
│── config/               # Database configuration
│── package.json          # Project dependencies
│── README.md             # Project documentation
```

## Installation
### Prerequisites
- Node.js and npm installed
- MySQL Server running

### Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/finance-tracker.git
   cd finance-tracker
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure the database:
   - Create a MySQL database.
   - Update `config/db.js` with your database credentials.
   - Import the provided SQL schema (if available).
4. Start the application:
   ```sh
   node server.js & node server1.js
   ```
5. Open the app in your browser at `http://localhost:3000`.

## Usage
1. **Register/Login** to access your dashboard.
2. **Set a monthly budget** under "Manage Budget".
3. **Add expenses** under "Manage Expenses".
4. **Monitor financial insights** on the Dashboard.

## Technologies Used
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Frontend:** HTML, CSS, JavaScript
- **Security:** bcrypt for password hashing

## Future Enhancements
- Implement expense analytics with charts.
- Add recurring expense tracking.
- Introduce expense sharing between users.

## Contributing
Contributions are welcome! Feel free to fork this repo, make changes, and submit a pull request.

---
Made with ❤️ by [Disha Singla](https://github.com/disha5678)

