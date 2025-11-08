# 🧭 Lalita API Documentation

### Version: 1.0.0

**Base URL:**

- **Production:** `https://api.lalita.africa/v1`
- **Development:** `http://localhost:5000/api/v1`

---

## 📖 Overview

**Lalita** is an inclusive fintech and mentorship platform designed to help **women MSMEs, petty traders, and PWDs** save securely, access mentorship in local languages, and learn digital safety.

This backend API supports:

- 🔐 **Authentication (JWT-based)**
- 🧑‍💼 **Admin management**
- 🪙 **Wallet and Savings (Moniepoint Integration)**
- 🎓 **Mentorship video system**
- 🌍 **Language translation**
- 💬 **Feedback and ratings**

---

## ⚙️ Tech Stack

- **Node.js** + **Express.js**
- **Supabase** (PostgreSQL backend + Storage)
- **Moniepoint API** (payments & savings)
- **JWT Authentication**

---

## 🔐 Authentication

All protected endpoints require a Bearer token.

```
Authorization: Bearer <your-jwt-token>
```

---

## 🧩 Endpoints

---

### 1️⃣ Auth Routes

| Method | Endpoint         | Description               | Auth |
| ------ | ---------------- | ------------------------- | ---- |
| POST   | `/auth/register` | Register a new user       | ❌   |
| POST   | `/auth/login`    | Login user and return JWT | ❌   |
| GET    | `/auth/profile`  | Get user profile          | ✅   |
| PATCH  | `/auth/update`   | Update user info          | ✅   |
| POST   | `/auth/logout`   | Logout user               | ✅   |

**Example Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": { "id": "uuid", "email": "user@email.com" }
}
```

---

### 2️⃣ Admin Routes

| Method | Endpoint                | Description      | Auth       |
| ------ | ----------------------- | ---------------- | ---------- |
| GET    | `/admin/users`          | Get all users    | ✅ (Admin) |
| PATCH  | `/admin/users/:id/role` | Update user role | ✅ (Admin) |
| DELETE | `/admin/users/:id`      | Delete user      | ✅ (Admin) |

---

### 3️⃣ Wallet Routes

| Method | Endpoint                | Description                              | Auth |
| ------ | ----------------------- | ---------------------------------------- | ---- |
| POST   | `/wallet/fund`          | Initialize wallet funding via Moniepoint | ✅   |
| GET    | `/wallet/:userId`       | Get wallet balance                       | ✅   |
| GET    | `/transactions/:userId` | Get paginated transaction history        | ✅   |

**Example Response:**

```json
{
  "status": "success",
  "paymentLink": "https://sandbox.monnify.com/checkout/MTY..."
}
```

---

### 4️⃣ Savings Routes

| Method | Endpoint                   | Description                  | Auth |
| ------ | -------------------------- | ---------------------------- | ---- |
| POST   | `/savings/create`          | Create a savings goal        | ✅   |
| POST   | `/savings/deposit`         | Deposit funds into savings   | ✅   |
| GET    | `/savings/balance/:userId` | Get user’s savings balance   | ✅   |
| GET    | `/savings/goals/:userId`   | Fetch all user savings goals | ✅   |

---

### 5️⃣ Mentorship Routes

| Method | Endpoint                     | Description                                | Auth       |
| ------ | ---------------------------- | ------------------------------------------ | ---------- |
| POST   | `/mentorship/add`            | Add a mentorship video (admin)             | ✅ (Admin) |
| GET    | `/mentorship/list/:language` | Fetch mentorship videos by language        | ✅         |
| POST   | `/mentorship/feedback`       | Submit user feedback on a mentorship video | ✅         |

---

### 6️⃣ Translation Routes

| Method | Endpoint                 | Description                           | Auth |
| ------ | ------------------------ | ------------------------------------- | ---- |
| POST   | `/translate`             | Translate text into selected language | ✅   |
| GET    | `/translate/history`     | Get user translation history          | ✅   |
| DELETE | `/translate/history/:id` | Delete translation record             | ✅   |

---

## 💬 Feedback Routes

| Method | Endpoint                  | Description                           | Auth |
| ------ | ------------------------- | ------------------------------------- | ---- |
| POST   | `/feedback`               | Submit feedback on a mentorship video | ✅   |
| GET    | `/feedback/:mentorshipId` | View feedback for a mentorship video  | ✅   |

---

## ⚙️ Error Response Format

```json
{
  "success": false,
  "message": "Error message here",
  "code": 400
}
```

---

## ✅ Success Response Format

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

---

## 🧾 Environment Variables (.env)

| Key                    | Description             |
| ---------------------- | ----------------------- |
| `PORT`                 | App port                |
| `NODE_ENV`             | Environment type        |
| `DATABASE_URL`         | Supabase DB connection  |
| `SUPABASE_URL`         | Supabase project URL    |
| `SUPABASE_SERVICE_KEY` | Supabase service key    |
| `JWT_SECRET`           | JWT secret key          |
| `MONIEPOINT_API_KEY`   | Moniepoint API key      |
| `MONIEPOINT_BASE_URL`  | Moniepoint API base URL |

---

## 📚 Folder Structure (Backend)

```
/lalita-backend
│
├── /controllers
│   ├── authController.js
│   ├── walletController.js
│   ├── savingsController.js
│   ├── mentorshipController.js
│   ├── transactionController.js
│   └── translateController.js
│
├── /routes
│   ├── authRoutes.js
│   ├── walletRoutes.js
│   ├── savingsRoutes.js
│   ├── mentorshipRoutes.js
│   ├── transactionRoutes.js
│   └── translateRoutes.js
│
├── /config
│   ├── supabaseClient.js
│   └── moniepointClient.js
│
├── /middleware
│   ├── authMiddleware.js
│   └── errorHandler.js
│
├── /docs
│   └── api-docs.md
│
├── server.js
└── package.json
```

---

## 🧠 Notes

- 🔐 All secure routes are JWT-protected.
- 🌐 Supabase handles database + storage (videos, users, savings).
- 💳 Moniepoint API handles deposits, savings, and withdrawals.
- 🧏‍♀️ The system supports multilingual content (English, Hausa, Pidgin(to be added soon)).

---

## 📜 License

Licensed under the **MIT License**.
© 2025 Lalita Fintech Solution.
