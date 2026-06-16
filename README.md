# 🛒 DesiCart — Shop India's Best

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white&style=flat-square)](https://vercel.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Next.js-blue?logo=react&logoColor=white&style=flat-square)](https://nextjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green?logo=nodedotjs&logoColor=white&style=flat-square)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-emerald?logo=mongodb&logoColor=white&style=flat-square)](https://www.mongodb.com/)
[![Payments](https://img.shields.io/badge/Payments-Razorpay-blue?logo=razorpay&logoColor=white&style=flat-square)](https://razorpay.com/)

DesiCart is a premium, high-performance, fully responsive full-stack e-commerce platform inspired by the dense and utilitarian shopping layouts of Amazon and Flipkart. Built using **Next.js 15**, **Node.js**, **Express**, **Tailwind CSS v4**, and **MongoDB**, it features a catalog of exactly 200 high-fidelity products, multi-seller stats, interactive search/filtering sidebars, and a fully functional wallet & checkout billing pipeline.

---

## 🚀 Key Features

* **📦 Catalog of 200 Real Products:** Pre-seeded with 40 distinct items across 5 categories (Electronics, Fitness, Groceries, Food, Clothing) featuring high-quality images, real prices, MRPs, discount badges, and ratings.
* **🔍 Amazon/Flipkart Dense Layout:**
  * **Two-Tier Header:** Sticky search, category selector, Location tracker, Account dropdowns, and a live Cart count widget.
  * **Dynamic Homepage:** Top promotional hero carousel banners, promotional 4-grid highlighted cards, and scrollable "Deals of the Day" lists.
* **⚡ Interactive Left Sidebar Filters:** Live filters for Category selection, Customer Reviews (e.g. 4★ & Up), and Price Ranges (e.g. Under ₹500, ₹1000 - ₹5000) with instant, reactive updates.
* **💳 Complete Billing & Checkout Pipeline:**
  * **Interactive Cart:** Real-time quantity adjustments, subtotal, shipping fee calculations, and sliding side drawer representation.
  * **Stepped Checkout Checkout:** Delivery details verification, shipping info forms, and secure payment selections.
  * **Three Payment Gateways:** Pay via Cash on Delivery (COD), Secure Razorpay Test order, or the **DesiCart Wallet** balance.
* **💰 Custom Wallet & Top-up:** Top-up your wallet using Razorpay sandbox transactions, track live balances, and verify instant checkouts with real-time balance deductions.
* **📊 Admin & Seller Dashboards:** Track global store statistics (active sellers, total revenue, overall listing counts).

---

## 🛠️ Tech Stack

| Frontend | Backend | Database & Gateway |
| :--- | :--- | :--- |
| **Next.js 15** (App Router) | **Node.js** (ES Modules) | **MongoDB Atlas** (Mongoose) |
| **TypeScript** | **Express.js** (Serverless Ready) | **Razorpay Node SDK** |
| **Tailwind CSS v4** | **Node-Watch** (Dev mode) | **In-memory Database Fallback** |
| **Framer Motion** | **Crypto** (Signatures) | **Unsplash/Picsum** (Images) |

---

## 📂 Project Architecture

```bash
Desi-Cart/
├── frontend/             # Next.js 15 app router frontend
│   ├── src/
│   │   ├── app/          # App router pages (Customer, Admin, Seller pages)
│   │   ├── components/   # Shared UI components (TopUpModal, Wallet, Navbar)
│   │   └── lib/          # API endpoint config helpers
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/              # Node/Express API server
│   ├── src/
│   │   └── index.js      # Main Express controller, database schemas, and API routes
│   └── package.json
│
├── vercel.json           # Unified monorepo Vercel routing configuration
└── README.md
```

---

## ⚙️ Local Development Setup

### 1. Clone & Prep Env
```bash
git clone https://github.com/dikshitsinhaofficial/Desi-Cart.git
cd Desi-Cart
```

Create a `.env` file inside the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/desicart
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
FRONTEND_URL=http://localhost:4008
```

Create a `.env.local` file inside the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. Install Dependencies
```bash
# In Root directory
npm install

# Install sub-project packages
cd backend && npm install
cd ../frontend && npm install
```

### 3. Run Dev Server
You can launch both applications concurrently using the root npm script:
```bash
# In Root directory
npm run dev
```
* **Frontend:** [http://localhost:4008](http://localhost:4008)
* **Backend API:** [http://localhost:5000](http://localhost:5000)

*Note: If no Mongo URI is provided, the API automatically mounts an **In-Memory Database** pre-seeded with 200 items, enabling you to test the full pipeline immediately!*

---

## ☁️ Vercel Deployment

DesiCart is designed for **Zero-Config Monorepo Deployment** using Vercel. Both the Express backend (deployed as serverless API functions) and the Next.js frontend are built and routed together using the root [vercel.json](file:///c:/Users/Dell/Desktop/Desi-Cart/vercel.json).

### Steps to Deploy:

1. **Connect Repository to Vercel:**
   * Go to [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
   * Import the `Desi-Cart` repository.

2. **Configure Environment Variables:**
   Add the following environment variables in the Vercel Project Settings:

   | Key | Value | Scope | Description |
   | :--- | :--- | :--- | :--- |
   | `MONGO_URI` | `mongodb+srv://...` | API | MongoDB Atlas Connection String |
   | `RAZORPAY_KEY_ID` | `rzp_test_...` | API / Frontend | Razorpay Public Key |
   | `RAZORPAY_KEY_SECRET` | `secret_...` | API | Razorpay Secret Key |

3. **Deploy:**
   * Leave build commands as default. Vercel automatically detects [vercel.json](file:///c:/Users/Dell/Desktop/Desi-Cart/vercel.json) and configures:
     * `/api/*` -> Maps to Express.js serverless function.
     * `/*` -> Maps to the Next.js static and dynamic app.
   * Click **Deploy**.

---

## 📄 License & Credits

Built by [Dikshit Sinha](https://github.com/dikshitsinhaofficial) as a high-fidelity e-commerce clone. Licensed under the MIT License.
