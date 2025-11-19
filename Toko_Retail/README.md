# 🏪 Toko Retail - POS & Inventory API

[![Made with Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Built with Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Database-Sequelize](https://img.shields.io/badge/Sequelize-v6-52B0E7?style=for-the-badge&logo=sequelize)](https://sequelize.org/)
[![Database-MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)

This is the complete backend API for a Point-of-Sale (POS) and inventory management system. It's built with Node.js, Express, and Sequelize, and it provides all the necessary endpoints to manage users, products, suppliers, and transactions.



## ✨ Features

* **Authentication:** JWT-based secure authentication with Admin and Staff roles.
* **CRUD Operations:** Full Create, Read, Update, and Delete for Products, Suppliers, and Users (Admin only).
* **Stock Management:** Atomic stock updates. Transactions automatically roll back if stock is insufficient.
* **Transaction Processing:** Handles sales, stock-ins, and returns.
* **Reporting:** Dynamic endpoints for dashboard stats, sales trends, and stock-level reports.
* **Security:** Includes rate limiting (anti-brute force) and CORS handling.

---

## 🛠️ Prerequisites

Before you begin, you **must** have these tools installed. This project **does not use** Laravel or Composer.

* **Node.js (LTS version)**: This provides `node` and `npm`.
* **XAMPP**: To easily run the **MySQL** database and **phpMyAdmin**.
* **Git**: For cloning the repository.
* **A Git Client**: (like VS Code's terminal, Git Bash, or CMD).

---

## ⚙️ How to Run (Installation)

### 1. Database Setup (XAMPP)

1.  Open your **XAMPP Control Panel** and **Start** the **Apache** and **MySQL** modules.
2.  Open your browser and navigate to `http://localhost/phpmyadmin`.
3.  Click **"New"** on the left sidebar.
4.  Enter the database name as `toko_retail` and click **"Create"**.

### 2. Project Installation

1.  Open your terminal.
2.  Clone this repository:
    ```bash
    git clone [YOUR_BACKEND_GITHUB_URL_HERE] Toko_Retail
    ```
3.  Navigate into the project folder:
    ```bash
    cd Toko_Retail
    ```
4.  Install all required packages:
    ```bash
    npm install
    ```
5.  Create your environment file by copying the example:
    ```bash
    cp .env.example .env
    ```
6.  Open the new `.env` file and configure your database. For a default XAMPP setup, the password is blank:
    ```env
    DB_DIALECT=mysql
    DB_HOST=localhost
    DB_PORT=3306
    DB_NAME=toko_retail
    DB_USER=root
    DB_PASSWORD=
    ```
7.  Run the database migrations (to build all tables) and seeders (to create the `admin` account):
    ```bash
    npm run db:reset
    ```

### 3. Running the Server

1.  Start the development server:
    ```bash
    npm run dev
    ```
2.  🎉 Your API server is now running at **`http://localhost:3000`**.