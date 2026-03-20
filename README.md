# 🏙️ CityFlow — Tamilnadu Government Smart City Platform

A full-stack smart city management system built for the **Tamilnadu Government**, enabling citizens and field workers to report and track civic issues in real time.

---

## 🌐 Live URLs

| Service | URL |
|---|---|
| 🔴 Admin Dashboard | https://smart-city-apn3.vercel.app |
| 🔵 Citizen & Worker Portal | https://smart-city-sand.vercel.app |
| ⚙️ Backend API | https://smart-city-qc23.onrender.com |

---

## 🔐 Login Credentials

### 👨‍💼 Admin Dashboard
| Field | Value |
|---|---|
| **URL** | Admin Vercel URL |
| **Email** | `admin@cityflow.gov.in` |
| **Password** | `admin123` |

---

### 👤 Citizen Portal (Mobile / Worker)
**URL:** Citizen Vercel URL

| Role | Email | Password |
|---|---|---|
| 🧑 **Citizen** | `citizen1@example.com` | `citizen123` |
| 👷 **Field Worker** | `worker1@smartcity.com` | `worker123` |

> Both Citizens and Field Workers log in through the **same portal link**. The app automatically adjusts the interface based on the role.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | SQLite |
| Auth | JWT (Access + Refresh Tokens) |
| AI | Gemini AI (Issue Detection) |
| Maps | Leaflet.js |

---

## 🚀 Run Locally

```bash
# Clone the repository
git clone https://github.com/dhanushmit/smart-city.git
cd smart-city/cityflow-app

# Install all dependencies
npm install

# Start all services (Admin + Citizen + Server)
npm run dev
```

| Service | Port |
|---|---|
| Backend API | http://localhost:5000 |
| Admin Dashboard | http://localhost:3000 |
| Citizen Portal | http://localhost:3001 |

---

## 📱 Mobile APK
The Citizen & Worker Portal is packaged as an Android APK using **Web2APK Pro**, providing a native mobile experience for field workers and citizens.

---

## 👨‍💻 Built by
**Dhanush** — Tamilnadu Government Smart City Hackathon 2026


---

## 🚀 Development & Infrastructure Tools

The CityFlow platform was developed and deployed using the following modern tech stack:

| Category | Tool |
|---|---|
| **IDE / Editor** | **Cursor** (AI-First Code Editor) |
| **Engineering Assistant** | **Antigravity** (Powered by Google Deepmind) — AI Software Engineer Assistant |
| **Version Control** | **Git & GitHub** |
| **Frontend Deployment** | **Vercel** |
| **Backend Deployment** | **Render.com** (with automatic Render wake-up logic) |
| **Database (Production)** | **PostgreSQL** |
| **AI Integration** | **Google Gemini AI** (Issue Detection & Codebase Development) |
| **Mobile Integration** | **Web2APK Pro** (Native Experience) |
