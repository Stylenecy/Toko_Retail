# 🎨 Toko Retail - POS Frontend (React)

[![Built with React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Powered by Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Styled with Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

This is the complete frontend UI for the Toko Retail POS application. It's a fast, modern, and fully responsive single-page application (SPA) built with React and Vite.

It connects to the **[Toko Retail API (Backend)]([YOUR_BACKEND_GITHUB_URL_HERE])** to handle all data.



## ✨ Features

* **Full Authentication:** Secure login/logout flow with JWT token handling and auto-redirect.
* **Dynamic Dashboard:** Features clickable stat cards and charts showing real-time sales trends.
* **Point of Sale (POS):** A "Kasir" interface with product search, modal quantity input, and cart management.
* **Full Management (CRUD):** Complete UI modules for managing Products, Suppliers, and Users (Admin only).
* **Transaction History:** A complete list of all transactions with powerful filters for "Today," "This Week," "This Month," and custom date ranges.
* **Dynamic Reports:** View sales summaries and low-stock product reports.

---

## 🛠️ Prerequisites

* **Node.js (LTS version)**: This provides `node` and `npm`.
* **Git**: For cloning the repository.
* **Backend Server Running**: The **[Toko Retail API]([YOUR_BACKEND_GITHUB_URL_HERE])** *must* be installed and running at `http://localhost:3000` for the frontend to work.

---

## ⚙️ How to Run (Installation)

1.  Open a **new terminal** (keep your backend server terminal running).
2.  Clone this repository:
    ```bash
    git clone [YOUR_FRONTEND_GITHUB_URL_HERE] pos-frontend
    ```
3.  Navigate into the project folder:
    ```bash
    cd pos-frontend
    ```
4.  Install all required packages:
    ```bash
    npm install
    ```

### 3. Running the Application

1.  Make sure your backend server is running first.
2.  Start the frontend development server:
    ```bash
    npm run dev
    ```
3.  🎉 Open your browser and navigate to **`http://localhost:5173`** (or the port shown in your terminal).