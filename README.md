# Sri Pothys Silks & Readymades

A full-stack e-commerce webpage for Sri Pothys Silks & Readymades, focused on Indian ethnic wear, fashion browsing, cart, wishlist, orders, admin management, and AI-assisted shopping.

## Project Structure

```text
Dressingshop_frontend/   React + Vite customer/admin webpage
Dressingshop_backend/    Express + MongoDB API server
```

## Main Features

- Home page with featured collections, categories, trending products, and store highlights
- Product listing with search, filters, sorting, and responsive product cards
- Product detail page with gallery thumbnails, size selection, quantity, reviews, wishlist, cart, and buy-now flow
- Authentication with login, signup, protected profile, cart, wishlist, orders, and admin pages
- Cart and checkout flow with free shipping logic above Rs.999
- Order history and order success pages
- Profile page with user details and saved addresses
- Admin dashboard for products, orders, customers, analytics, and profile settings
- AI Stylist page that analyzes uploaded images in the browser and recommends outfits
- Chatbot assistant powered through the backend, using the Groq API key from backend `.env` only

## Tech Stack

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- TensorFlow.js for browser-side AI Stylist

Backend:

- Node.js
- Express
- MongoDB Atlas with Mongoose
- JWT authentication
- Groq API proxy for chatbot responses

## Local Setup

Install dependencies separately:

```bash
cd Dressingshop_backend
npm install
```

```bash
cd Dressingshop_frontend
npm install
```

Create backend environment file:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
GROQ_API_KEY=your_groq_api_key
```

Create frontend environment file if needed:

```env
VITE_API_URL=http://127.0.0.1:5000/api
```

Run backend:

```bash
cd Dressingshop_backend
npm run dev
```

Run frontend:

```bash
cd Dressingshop_frontend
npm run dev
```

Open the frontend URL shown by Vite, usually:

```text
http://localhost:8080
```

## Build And Validation

Frontend:

```bash
cd Dressingshop_frontend
npm run lint
npm run test
npm run build
```

Backend:

```bash
cd Dressingshop_backend
npm start
```

Health check:

```text
http://localhost:5000/api/health
```

## Deployment Notes

Frontend can be hosted on Vercel.

Set this Vercel environment variable:

```env
VITE_API_URL=https://your-render-backend.onrender.com/api
```

Backend can be hosted on Render.

Set these Render environment variables:

```env
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-vercel-frontend.vercel.app
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
GROQ_API_KEY=your_groq_api_key
```

## Security Notes

- Do not put Groq API keys in frontend `.env` files.
- Do not expose MongoDB credentials or JWT secrets in frontend code.
- `.env` files are ignored by git.
- The chatbot calls the backend first, and the backend securely calls Groq.

## Important Pages

```text
/                 Home
/products          Product listing
/products/:id      Product details
/cart              Cart
/checkout          Checkout
/wishlist          Wishlist
/orders            Order history
/profile           User profile
/ai-stylist        AI outfit recommendations
/admin             Admin dashboard
/login             Login
/signup            Signup
```

## Summary

This project is a complete online clothing shop webpage with customer shopping flows, admin tools, MongoDB-backed APIs, AI styling, and a backend-secured chatbot. It is designed to run locally during development and deploy as a Vercel frontend with a Render backend.
