# AssetFlow - Enterprise Asset & Resource Management System

AssetFlow is a web-based Enterprise Asset & Resource Management System designed to streamline tracking physical assets and managing shared resource bookings.

---

## System Requirements

- **Node.js**: v18+ recommended
- **MySQL Database Server**: v8.0+ running on port `3306`
- **npm** or **yarn** package manager

---

## 1. Database Setup

Make sure your MySQL database server is running.

1. Configure the environment variables in `backend/.env`. (The default configuration is already set to connect to MySQL on `localhost:3306` with database `AssetFlow`).
2. Sync the Prisma schema with your MySQL database and generate the Prisma Client:
   ```bash
   cd backend
   npx prisma db push --force-reset
   ```
3. Seed the database with mock data (departments, categories, assets, users, allocations, bookings, maintenance requests):
   ```bash
   node prisma/seed.js
   ```

---

## 2. Running the Backend

The backend is built using Node.js and Express.

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start the development server (runs on port `5000` via nodemon):
   ```bash
   npm run dev
   ```

---

## 3. Running the Frontend

The frontend is built using React + Vite + Tailwind CSS.

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start the development server (runs on port `3000` with API proxying to the backend):
   ```bash
   npm run dev
   ```

---

## Default User Accounts for Testing

Once you run the database seed script, you can log in using the following accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@assetflow.com` | `admin123` |
| **Asset Manager** | `manager@assetflow.com` | `admin123` |
| **Department Head** | `head@assetflow.com` | `admin123` |
| **Employee** | `employee@assetflow.com` | `employee123` |
| **Employee (Test)** | `employee@test.com` | `employee123` |
