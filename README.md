# 🛍️ SRI POTHYS SILKS & READYMADES

> **AI‑Powered Full‑Stack Fashion E‑Commerce Platform**  
> Discover, personalize, and shop Indian ethnic & modern wear with an AI stylist, smart filtering, and a built‑in shopping assistant.

## Overview
Portfolio-style **full‑stack fashion e‑commerce** app for **Sri Pothys Silks & Readymades**.

**Includes**
- **Frontend:** Vite + React + TypeScript (responsive UI, AI stylist, chatbot)
- **Backend:** Node.js + Express + MongoDB (JWT auth, products/orders/admin APIs)

**Demo brand context (used by the chatbot)**
- Started: 2000
- Address: 62, North St, Swamimalai, Kumbakonam, Alavandipuram, Tamil Nadu 612302

## Contents
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Setup](#setup)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)
- [Developer](#developer)
- [License](#license)

---

## ✨ Key Features

- **Storefront:** product listing + details, filters (category/occasion/color/price), search, sorting
- **Auth & profiles:** JWT login/register, profile updates, session expiry + frontend auto-logout
- **Cart & orders:** server-side cart, checkout (UPI/Card/COD), order success + order history
- **Store UX:** free shipping above ₹999 + 7‑day return messaging
- **Admin dashboard:** manage products/orders/users + basic analytics
- **AI recommendations (AI Stylist):** image upload → **TensorFlow.js MobileNet (in-browser)** → outfit recommendations
- **Chatbot assistant:** floating widget with local responses + **optional** Groq chat-completions fallback
- **Responsive design:** Tailwind UI, mobile-friendly admin layout, dark mode
- **Deployment-ready:** separate frontend/backend deploy flow (Vercel/Netlify + Render/Railway + Atlas)

---

## 🧰 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, lucide-react |
| Backend | Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, cors, dotenv |
| AI / ML | TensorFlow.js, MobileNet (browser-side), Canvas API, heuristic recommendation scoring |
| Tooling | Vitest + Playwright config present |

---

## 🧱 Architecture

Simple view (kept intentionally lightweight):

```text
User → Frontend (React/Vite) → Backend (Express) → Database (MongoDB)
                     ↘
                      AI Module (TFJS/MobileNet, in-browser)
                     ↘
          Chatbot (local logic + optional Groq fallback)
```

**Catalog note:** the UI supports a **hybrid catalog** (API-backed products + local demo fallback data) so the frontend remains usable even before seeding MongoDB.

---

## 🗂️ Folder Structure

```text
.
├─ backend/                  # Express API + MongoDB
└─ Dressingshop_frontend/    # Vite + React + TypeScript UI
```

**Where to look**
- Frontend pages: `Dressingshop_frontend/src/pages/`
- AI stylist: `Dressingshop_frontend/src/services/tensorflowStylist.ts`
- Chatbot: `Dressingshop_frontend/src/components/Chatbot.tsx`
- Backend entry: `backend/server.js`

---

## 🛠️ Setup

### Prerequisites
- Node.js (LTS)
- MongoDB (local) or MongoDB Atlas

### Backend
```bash
cd backend
npm install
```

Create `backend/.env` (minimum):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/dressingshop
JWT_SECRET=replace_with_a_long_random_secret
CORS_ORIGIN=http://localhost:5173
```

Start:
```bash
npm run dev
# or: npm start
```

### Frontend
```bash
cd Dressingshop_frontend
npm install
npm run dev
```

Optional `Dressingshop_frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### (Optional) Seed products
```bash
cd backend
node seed-products.js
```

For deeper API details, see [backend/README.md](backend/README.md) and [backend/FRONTEND_INTEGRATION.md](backend/FRONTEND_INTEGRATION.md).

---

## 🚀 Deployment

Recommended split:
- **Frontend:** Vercel / Netlify (`npm run build`, output `dist`, set `VITE_API_URL`)
- **Backend:** Render / Railway (`npm start`, env: `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`)
- **Database:** MongoDB Atlas

---

## 🖼️ Screenshots

Place images under `./docs/screenshots/` (or update paths accordingly):

```md
![Home](./docs/screenshots/home.png)
![Products](./docs/screenshots/products.png)
![AI Stylist](./docs/screenshots/ai-stylist.png)
![Admin Dashboard](./docs/screenshots/admin-dashboard.png)
```

---

## 🔮 Future Enhancements

- Payment gateway integration (Razorpay/Stripe)
- Wishlist persistence + cross-device sync
- Email notifications + invoice generation
- Smarter personalization (embeddings / collaborative filtering)
- Advanced search (Atlas Search / hybrid search)
- Move chatbot keys server-side + add rate limiting

---

## 👤 Developer

- **Developer:** Your Name Here
- **Role:** Full‑Stack Developer
- **GitHub:** https://github.com/your-username

---

## 📄 License

MIT
