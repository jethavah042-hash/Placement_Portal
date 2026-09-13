# 🎓 Placement Preparation Portal

A comprehensive, full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** web application engineered to empower university students preparing for campus recruitment drives, competitive programming assessments, and corporate hiring processes.

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Dual_Tokens-black?style=flat-square&logo=json-web-tokens&logoColor=white)](https://jwt.io/)

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Architecture & Structure](#-project-architecture--structure)
- [Installation & Local Setup](#-installation--local-setup)
- [Environment Variables (.env Setup)](#-environment-variables-env-setup)
- [Production Deployment Guide](#-production-deployment-guide)
  - [Deploying Backend on Render](#1-deploying-backend-on-render)
  - [Deploying Frontend on Netlify](#2-deploying-frontend-on-netlify)
- [Security & Best Practices](#-security--best-practices)
- [Author & Credits](#-author--credits)

---

## 📖 About the Project

The **Placement Preparation Portal** is designed to provide students with a single, unified, high-performance ecosystem for end-to-end placement training. It incorporates interactive study guides, standardized assessment arenas, algorithmic problem-solving with automated sandboxed evaluation, ATS resume parsing, behavioral interview toolkits, and dynamic institutional performance analytics.

---

## 🚀 Key Features

### 👨‍🎓 Student Ecosystem
1. **Interactive Learning Tracks:**
   - **Quantitative Aptitude:** 15 comprehensive math topics with formulas, speed shortcuts, and untimed practice MCQs.
   - **Logical Reasoning:** Golden deduction notes, analytical puzzles, and category-wise practice sets.
   - **Verbal Ability & English:** Vocabulary flashcards with status tracking, grammar rule notes, and split-screen Reading Comprehension passage reader.
   - **Programming Concepts:** 12 core technology stacks (C, C++, Java, Python, JavaScript, DBMS, OS, Computer Networks, etc.).

2. **Algorithmic Coding Sandbox (DSA):**
   - 11 Data Structure tracks (Arrays, Trees, Graphs, DP, Strings, etc.).
   - Browser-based IDE supporting multiple languages (C++, Java, Python, JavaScript).
   - Real-time execution against sample and hidden unit test cases with time & memory limit constraints.

3. **Standardized Mock Assessment Arena:**
   - Real-time countdown timer, question palette with status badges (Answered, Marked for Review, Visited, Unvisited).
   - Negative marking penalty engine and post-test solution audits.
   - Global & batch candidate leaderboard rankings.

4. **Company-Specific Hiring Modules:**
   - Targeted preparation blueprints for Top Tech Recruiters (TCS, Infosys, Wipro, Amazon, Google, etc.).
   - Selection process round breakdowns, STAR behavioral HR questions, and verified alumni interview journals.

5. **ATS Resume Scanner & Builder:**
   - Automated PDF/DOCX resume file parsing and technical keyword matching.
   - ATS compatibility score calculation (0–100%) and missing skills recommendations.
   - Built-in ATS-friendly resume generator with live A4 preview and print/PDF export.

6. **AI Placement Insights & Diagnostics:**
   - 7-day problem-solving velocity charts and domain-wise accuracy radar.
   - Placement readiness percentage gauge.

---

### 🛡️ Admin Governance Suite
- **Student Management:** View student dossiers, academic standing, practice streaks, and toggle account access.
- **Question Bank CRUD:** Unified creation, editing, and bulk management for Aptitude, Reasoning, and English questions.
- **Coding Problem Manager:** Create coding challenges with sample test cases, hidden assertions, time/memory limits, and starter templates.
- **Assessment Assembler:** Assemble custom mock tests by picking questions across categories.
- **Campus Drives & Announcements:** Post recruitment notices with CTC packages, eligibility criteria, and deadlines.
- **Audit Logs & Export:** Platform activity audit stream and CSV reports export.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React.js 18 with Vite
- **Styling:** Tailwind CSS (Custom Design System with Academic Indigo & Slate tokens)
- **Routing:** React Router v7
- **Charts & Telemetry:** Chart.js & React-Chartjs-2
- **Icons:** React Icons (`react-icons/fi`, `react-icons/fa`)
- **HTTP Client:** Axios with automated JWT Refresh Token interceptors

### Backend
- **Runtime:** Node.js (v20+)
- **Framework:** Express.js (REST API Architecture with 204 Endpoints)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** Dual-Token JWT (Short-lived Access Token + Secure httpOnly Refresh Token)
- **Password Security:** Bcryptjs (12 Salt Rounds)
- **Middlewares & Security:** Helmet, Express-Rate-Limit, Express-Mongo-Sanitize, CORS, Cookie-Parser, Multer

---

## 📂 Project Architecture & Structure

```text
Placement_Portal/
│
├── backend/                        # Node.js & Express REST API Server
│   ├── config/                     # Database and environment configurations
│   ├── controllers/                # Business logic handlers
│   ├── middlewares/                # Auth, RBAC, Rate-limiting, Error handlers
│   ├── models/                     # Mongoose database schemas
│   ├── routes/                     # Modular API route definitions
│   ├── services/                   # Business and third-party services
│   ├── utils/                      # Helper utilities, JWT signers, Mailers
│   ├── app.js                      # Express app configuration & middleware pipeline
│   ├── server.js                   # Server entrypoint & DB connection
│   ├── create_admin.js             # CLI utility to create/manage administrator accounts
│   ├── package.json
│   └── .env.example
│
├── frontend/                       # React.js SPA Client (Vite)
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── api/                    # Axios API service endpoints & interceptors
│   │   ├── components/             # Reusable UI components (PageHeader, StatCard, etc.)
│   │   ├── context/                # React Context providers (AuthContext)
│   │   ├── pages/
│   │   │   ├── admin/              # Admin governance dashboards and managers
│   │   │   ├── auth/               # Authentication views (Login, Register, OTP, etc.)
│   │   │   └── student/            # Student learning modules, coding IDE, and mock tests
│   │   ├── App.jsx                 # Route declarations & ProtectedRoute guards
│   │   ├── main.jsx                # React root mount
│   │   └── index.css               # Design system tokens and utility classes
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── .gitignore                      # Git ignore rules for node_modules, build artifacts, envs
└── README.md                       # Complete Project Documentation
```

---

## 💻 Installation & Local Setup

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js**: v18.x or v20.x ([Download Node.js](https://nodejs.org/))
- **npm**: v9.x or higher
- **MongoDB**: Local MongoDB Community Server running on port `27017` or a MongoDB Atlas connection URI

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/jethavah042-hash/Placement_Portal.git
cd Placement_Portal
```

---

### Step 2: Setup the Backend
1. Open a terminal and navigate into the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:5000`.*

---

### Step 3: Setup the Frontend
1. Open a second terminal and navigate into the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will open at `http://localhost:5173`.*

---

### Step 4: Create an Initial Administrator Account
To access the Admin Governance Console, run the included CLI helper from the `backend/` folder:
```bash
cd backend
node create_admin.js "admin@placementportal.com" "Admin@password123" "Administrator"
```

---

## 🔑 Environment Variables (.env Setup)

### Backend Configuration (`backend/.env.example`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/placement_portal
JWT_SECRET=replace_with_64_byte_random_hex
JWT_REFRESH_SECRET=replace_with_different_64_byte_random_hex
JWT_EXPIRES_IN=7d
COOKIE_EXPIRES_IN=7
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES_SHORT=1d
JWT_REFRESH_EXPIRES_LONG=30d
AI_PROVIDER=mock
OPENAI_API_KEY=
OPENAI_MODEL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=Placement Portal <no-reply@placementportal.com>

OTP_EXPIRES_MIN=5
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SEC=60
RESET_TOKEN_EXPIRES_MIN=30
```

### Frontend Configuration (`frontend/.env.example`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_TITLE="Placement Preparation Portal"
```

---

## 🌐 Production Deployment Guide

### 1. Deploying Backend on Render

1. Create a free account on [Render](https://render.com/).
2. Create a new **Web Service** and connect your GitHub repository.
3. Configure the service:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Add the following **Environment Variables** in Render Dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: *Your MongoDB Atlas connection URI*
   - `CLIENT_URL`: *Your Netlify frontend domain (e.g. `https://your-app.netlify.app`)*
   - `JWT_SECRET`: *A secure 64-character random string*
   - `JWT_REFRESH_SECRET`: *A second secure 64-character random string*
   - `COOKIE_EXPIRES_IN`: `7`
   - `JWT_ACCESS_EXPIRES`: `15m`
   - `JWT_REFRESH_EXPIRES_SHORT`: `1d`
   - `JWT_REFRESH_EXPIRES_LONG`: `30d`

---

### 2. Deploying Frontend on Netlify

1. Create a free account on [Netlify](https://www.netlify.com/).
2. Click **Add new site** → **Import an existing project** from GitHub.
3. Select your `Placement_Portal` repository.
4. Configure Build settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Add the **Environment Variable** in Netlify:
   - `VITE_API_BASE_URL`: `https://your-render-backend-service.onrender.com/api`
6. *(Single Page Application Routing)*: Create a `_redirects` file inside `frontend/public/_redirects` (or Netlify automatically handles it) with:
   ```text
   /*    /index.html   200
   ```
7. Click **Deploy Site**.

---

## 🔒 Security & Best Practices

- **Zero Plain-text Passwords:** Strict 12-round bcrypt salted hashing.
- **XSS Protection:** Access tokens and Refresh tokens are transmitted over `httpOnly`, `sameSite: 'lax'` cookies.
- **NoSQL Injection Defense:** `express-mongo-sanitize` scrubs all malicious MongoDB operators from request inputs.
- **Brute-Force & Rate Limiting:** Automatic 15-minute account lockout after 5 consecutive failed login attempts.
- **Clean Git Tracking:** All dependencies, environment secrets, and build outputs are excluded via root `.gitignore`.

---

## 👤 Author

**Hardik Vala (Hardik Jethava)**
- GitHub: [@jethavah042-hash](https://github.com/jethavah042-hash)
- Academic Institution: Marwadi University
- Specialization: MCA (Master of Computer Applications)

---

## 📄 License

This project is developed for academic and career preparation purposes. All rights reserved.
