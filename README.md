# Comhard Support Desk System — Full-Stack Engineering Assessment

A production-ready **SaaS Support Desk & Ticketing System** engineered for **Comhard Technologies Pvt. Ltd.** campus recruitment drive.

## 🚀 Key Features
- **Dual Role Access Control (RBAC):** Customer Portal & Support Agent Console.
- **Ticket Lifecycle State Machine:** `Open` → `In Progress` → `Resolved` → `Closed`.
- **Private Internal Agent Notes:** Support agents can post internal notes (`is_internal_note: true`) hidden from customers.
- **Real-time SLA Metrics:** Track total volume, open tickets, high priority issues, and resolution rates.
- **One-Click Demo Switcher:** Top navbar allows switching between Customer & Agent views instantly during interview demos.
- 
## 🛠️ Technology Stack & System Architecture

### 🌐 Frontend (Client-Side)
- **Framework:** [React 18](https://react.dev/) — Component-driven declarative UI for dynamic state updates and fast component re-rendering.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework for clean, modern SaaS dashboard aesthetics matching Comsky UI standards.
- **Build Tool:** [Vite](https://vitejs.dev/) — Ultra-fast ES-modules bundler for instant Hot Module Replacement (HMR).
- **Architecture:** Role-Based Access Control (RBAC) separating **Customer Portal** and **Support Agent Command Center**.

### ⚙️ Backend (Server-Side)
- **Runtime Environment:** [Node.js](https://nodejs.org/) (v18+) — Non-blocking asynchronous I/O event loop for handling high-concurrency requests.
- **Framework:** [Express.js](https://expressjs.com/) — RESTful API routing, JSON middleware, and state machine management.
- **Security & Headers:** [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) configured for cross-origin resource sharing between Client (Port 3000) and Backend API (Port 5000).
- **Authorization:** Token-based session management and backend-level data isolation for private internal notes.

### 🗄️ Database & Storage Layer
- **Database Engine:** Native Transactional JSON Document Store (`server/database.json` managed via `db.js`).
- **Data Collections:** `users`, `tickets`, `messages` (public replies & private notes), `categories`, `audit_logs`.
- **Key Advantage:** Zero-dependency instant local execution that runs 100% cross-platform on any OS without requiring external database installation.

### 📊 Engineering & Features Summary
- **Ticket Lifecycle State Machine:** `Open` → `In Progress` → `Pending Customer` → `Resolved` → `Closed`.
- **Private Internal Agent Notes:** Support engineers can publish private debugging notes (`is_internal_note: true`) hidden from customer views.
- **Automated Audit Trail:** Real-time activity logging tracking status transitions, priority escalations, and agent assignments.
- **Real-Time SLA Analytics:** Command center dashboard tracking total volume, open queue, in-progress count, and urgent priority incidents.

## 💻 Setup & Local Execution
```bash
# 1. Run Backend Server (Port 5000)
cd server
npm start

# 2. Run Frontend Client (Port 3000)
cd client
npm run dev
```

Developed for Comhard Technologies Pvt. Ltd. Recruitment Drive.
