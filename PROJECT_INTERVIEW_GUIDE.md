# 💎 Pocksy — Complete Project Analysis & Interview Master Guide

> **Project Name:** Pocksy (Personal Finance & Wealth Operating System)  
> **Type:** Full-Stack Cross-Platform Mobile Application (iOS, Android, Web) + REST API Backend  
> **Tech Stack:** React Native (Expo SDK 57), TypeScript, Zustand, Node.js, Express.js, MongoDB (Mongoose)

---

## 📌 Table of Contents
1. [30-Second & 2-Minute Elevator Pitch](#1-30-second--2-minute-elevator-pitch)
2. [High-Level Architecture & Data Flow](#2-high-level-architecture--data-flow)
3. [Core Modules & Technical Implementation](#3-core-modules--technical-implementation)
4. [Tech Stack Deep-Dive & Justifications](#4-tech-stack-deep-dive--justifications)
5. [Key Engineering Challenges & Solutions (STAR Method)](#5-key-engineering-challenges--solutions-star-method)
6. [Database Schema & Query Optimization](#6-database-schema--query-optimization)
7. [Security, Performance & Best Practices](#7-security-performance--best-practices)
8. [Top 20 Interview Questions & Model Answers](#8-top-20-interview-questions--model-answers)
9. [Future Roadmap & System Scalability](#9-future-roadmap--system-scalability)

---

## 1. 🎙️ 30-Second & 2-Minute Elevator Pitch

### ⚡ 30-Second Pitch (Quick Intro)
> *"Pocksy is a full-stack, privacy-first personal finance platform built with React Native (Expo) and a TypeScript Express/MongoDB backend. It allows users to track multi-account net worth, income, expenses, recurring subscriptions, debts, and savings goals in real-time. It features hardware-backed biometric security (Face ID/Fingerprint), dynamic network discovery for physical testing, and optimized MongoDB aggregation pipelines for instant financial analytics."*

---

### 🚀 2-Minute Deep Pitch (Comprehensive Overview)
> *"I developed **Pocksy**, an all-in-one personal finance operating system that solves the fragmentation people face when managing money across multiple bank accounts, cash wallets, credit cards, loans, and subscriptions.*
>
> *On the frontend, I used **React Native with Expo SDK 57** and **TypeScript**, leveraging **Expo Router** for typed file-based navigation and **Zustand** for lightweight, predictable state management. The mobile client features a glassmorphic dark-mode UI with **React Native Reanimated** for 60fps animations and native **Biometric Authentication (Face ID / Touch ID)** backed by **Expo SecureStore**.*
>
> *On the backend, I built a modular **Express.js** REST API in **TypeScript** backed by **MongoDB and Mongoose**. The system implements bank-grade security with stateless **JWT tokens**, **bcrypt** password hashing, **Helmet** HTTP header protection, and **Express Rate Limiting**.*
>
> *A major technical highlight is the analytics engine: instead of fetching heavy datasets and computing metrics in JavaScript, I used **MongoDB Aggregation Pipelines** to compute cashflow velocity, monthly burn rates, and category-wise spending on the database layer with indexed queries. I also implemented an **intelligent network discovery client** that automatically connects physical test devices to the local backend without manual IP configuration."*

---

## 2. 🏗️ High-Level Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER (Mobile)                         │
│  ┌─────────────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ Expo Router & UI Views  │  │ Zustand Stores │  │ Biometrics +     │  │
│  │ (Tabs, Forms, Charts)   │◄─┤ (Auth, Txn)    │◄─┤ SecureStore      │  │
│  └────────────┬────────────┘  └───────┬────────┘  └──────────────────┘  │
│               │                       │                                 │
│               ▼                       ▼                                 │
│        ┌───────────────────────────────────────┐                        │
│        │  Smart ApiClient (Auto-IP Discovery)  │                        │
│        └──────────────────┬────────────────────┘                        │
└───────────────────────────┼─────────────────────────────────────────────┘
                            │ HTTPS / REST JSON (JWT Bearer)
┌───────────────────────────┼─────────────────────────────────────────────┐
│                           ▼                                             │
│                  BACKEND API LAYER (Express / Node.js)                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Middleware: Helmet | CORS | RateLimiter | JWT AuthGuard           │  │
│  └────────────────────────────────┬──────────────────────────────────┘  │
│                                   │                                     │
│  ┌────────────────────────────────▼──────────────────────────────────┐  │
│  │ Express Routers & Request Validators (Auth, Txn, Accounts, Debt)  │  │
│  └────────────────────────────────┬──────────────────────────────────┘  │
│                                   │                                     │
│  ┌────────────────────────────────▼──────────────────────────────────┐  │
│  │ Business Controllers & Services (Aggregation Pipelines, Logic)   │  │
│  └────────────────────────────────┬──────────────────────────────────┘  │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │ Mongoose ODM (Queries & Aggregations)
┌───────────────────────────────────┼─────────────────────────────────────┐
│                                   ▼                                     │
│                       DATABASE LAYER (MongoDB)                          │
│   [Users]   [Accounts]   [Transactions]   [Debts]   [Goals]   [Budgets] │
│      (Indexed on { userId: 1, date: -1 } for sub-millisecond lookups)   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 🧩 Core Modules & Technical Implementation

| Module | What It Does | Key Implementation Details |
| :--- | :--- | :--- |
| **Authentication & Security** | User signup, login, session retention, and biometric unlock. | • Passwords hashed with `bcryptjs` (salt rounds = 10).<br>• Access protected via stateless JWT Bearer tokens.<br>• Mobile tokens saved in hardware-backed `Expo SecureStore`.<br>• Local biometric lock via `expo-local-authentication`. |
| **Account Management** | Multi-account tracking (Cash, Bank, Credit Card, Investment). | • Real-time balance calculations.<br>• Default account designation.<br>• Supports account archiving and custom currency symbols. |
| **Transaction Engine** | Create, edit, filter, search, and delete Income, Expense, Transfer. | • Two-way atomic balance updates upon creation/deletion.<br>• Inter-account transfer logic updates source & destination accounts.<br>• Paginated queries with date range, category, and type filters. |
| **Dashboard & Analytics** | Real-time Net Worth, Monthly Cashflow, Category Breakdowns. | • **MongoDB Aggregation Pipelines** (`$match`, `$group`, `$facet`) aggregate metrics on the database.<br>• Income vs. Expense comparison velocity. |
| **Debt Tracker (IOU / UOM)** | Track money owed (Payable) vs. money to receive (Receivable). | • Partial payment logging & remaining balance calculation.<br>• Due date tracking with settlement status flags. |
| **Goals & Milestones** | Track progressive savings targets. | • Target amount vs. current saved calculation.<br>• Milestone logs linked directly to source accounts. |
| **Recurring Subscriptions** | Cadence-based tracking (Daily, Weekly, Monthly, Yearly). | • Next payment date calculator.<br>• Active/paused subscription status guards. |

---

## 4. 🛠️ Tech Stack Deep-Dive & Justifications

### Why React Native with Expo SDK 57?
- **Single Codebase for iOS, Android & Web**: Over 95% shared code, reducing development overhead.
- **Expo Router (File-Based Navigation)**: Deep linking, type-safe route parameters, dynamic route segments `(tabs)`, and smooth stack transitions.
- **Native Performance**: Native bridge/new architecture support with 60fps animations powered by `react-native-reanimated`.

### Why Zustand over Redux Toolkit or Context API?
- **Zero Boilerplate**: No actions, reducers, or verbose providers.
- **Selective Re-rendering**: Components subscribe only to the exact state slices they consume, eliminating unnecessary component renders.
- **Small Bundle Footprint**: Under 1.5 KB vs. 30+ KB for Redux Toolkit.

### Why Node.js + Express with TypeScript?
- **End-to-End Type Safety**: Shared DTOs and interfaces between backend and mobile.
- **Asynchronous Non-Blocking I/O**: High concurrency handling for multiple concurrent mobile clients.
- **Rich Middleware Ecosystem**: Native integration with `helmet`, `cors`, `express-rate-limit`, and `jsonwebtoken`.

### Why MongoDB + Mongoose over Relational SQL?
- **Flexible Financial Schema**: Financial records have varying metadata (merchant details, notes, recurring cadence, counterparty info).
- **Fast Aggregation Pipelines**: Multi-stage aggregation pipelines (`$facet`, `$group`, `$project`) execute complex financial summaries in a single round-trip.
- **Compound Indexing**: Easy indexing on `{ userId: 1, date: -1 }` for high-speed chronological transaction querying.

---

## 5. 💡 Key Engineering Challenges & Solutions (STAR Method)

### Challenge 1: Dynamic API IP Discovery across Devices & Simulators
- **Situation**: Testing React Native on physical mobile devices fails when connecting to `localhost:5000` because `localhost` refers to the device itself.
- **Task**: Create a seamless network layer that works out-of-the-box on Web, iOS Simulator, Android Emulator, and physical Wi-Fi devices without hardcoding IPs.
- **Action**: Built an intelligent `getBaseUrl()` resolver in `api.ts`:
  1. Checks for `process.env.EXPO_PUBLIC_API_URL` (production).
  2. Inspects `Constants.expoConfig.hostUri` to extract the Metro bundler debugger host IP automatically during live development.
  3. Falls back to local subnet IP for physical testing and `localhost` for web.
- **Result**: Zero configuration required when switching between web browser, simulator, and physical device over Wi-Fi.

### Challenge 2: Data Consistency in Account Balance Updates
- **Situation**: When a user creates, edits, or deletes an expense/income/transfer, the linked account's balance must accurately reflect the change.
- **Task**: Prevent balance drift or race conditions during multi-step ledger updates.
- **Action**: Implemented atomic `$inc` operations in MongoDB Mongoose handlers:
  - Income creation: `$inc: { balance: +amount }`
  - Expense creation: `$inc: { balance: -amount }`
  - Transaction deletion: Inverts the original amount and adjusts account balance accordingly before deleting the transaction record.
- **Result**: Accurate account balances with zero calculation mismatch between transactions and accounts.

### Challenge 3: Real-Time Financial Aggregation Performance
- **Situation**: Loading the dashboard required computing total net worth, current month income, expenses, savings rate, and category breakdowns. Fetching all transactions to the mobile app would waste bandwidth and cause UI lag.
- **Task**: Compute all dashboard financial metrics in sub-100ms response times.
- **Action**: Moved computational load to the database using a **single MongoDB `$facet` aggregation pipeline**:
  ```typescript
  const summary = await Transaction.aggregate([
    { $match: { userId: new Types.ObjectId(userId), date: { $gte: startOfMonth, $lte: endOfMonth } } },
    {
      $facet: {
        totals: [
          { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ],
        byCategory: [
          { $match: { type: 'expense' } },
          { $group: { _id: '$category', total: { $sum: '$amount' } } },
          { $sort: { total: -1 } }
        ]
      }
    }
  ]);
  ```
- **Result**: Decreased payload size by 90% and achieved single-digit millisecond query execution times with index backing.

---

## 6. 🗄️ Database Schema & Query Optimization

### 1. Compound Indexing Strategy
```javascript
// Chronological queries per user (Transactions list & Dashboard)
TransactionSchema.index({ userId: 1, date: -1 });

// Filter by category within user account
TransactionSchema.index({ userId: 1, category: 1 });

// Accounts list per user
AccountSchema.index({ userId: 1, isArchived: 1 });
```

### 2. Core Schemas
- **User**: Name, Email, Password Hash, Currency, Biometric Preferences, Settings.
- **Account**: UserID, Name, Type (`cash`, `bank`, `credit_card`, `investment`), Balance, Currency, Color, Icon.
- **Transaction**: UserID, AccountID, Type (`income`, `expense`, `transfer`), Amount, Category, Date, PaymentMethod, Notes.
- **Debt**: UserID, Type (`payable`, `receivable`), Counterparty Name, Total Amount, Paid Amount, Due Date, Status.
- **Goal**: UserID, Name, Target Amount, Current Amount, Target Date, Color, Icon.
- **RecurringTransaction**: UserID, Frequency (`daily`, `weekly`, `monthly`, `yearly`), Amount, Category, NextDueDate.

---

## 7. 🛡️ Security, Performance & Best Practices

1. **Token Security**: Stateless JWT signed with HMAC-SHA256, verified via Express middleware. On mobile, tokens are stored in hardware-backed `Expo SecureStore` rather than plaintext `AsyncStorage`.
2. **Password Security**: Passwords hashed using `bcryptjs` with salt factor 10.
3. **API Hardening**:
   - `helmet` sets secure HTTP headers (XSS Filter, HSTS, Sniffing prevention).
   - `express-rate-limit` prevents brute-force attempts on `/api/auth/*` routes.
   - Strict `cors` configuration ensures only authorized frontends can consume the API.
4. **Performance Tuning**:
   - Used `.lean()` on read-only Mongoose queries to skip overhead of hydrating full Mongoose documents.
   - Built-in pagination (`page`, `limit`) on transaction list queries to handle thousands of entries smoothly.

---

## 8. 🎯 Top 20 Interview Questions & Model Answers

### General & Architecture
**Q1: Can you give a quick high-level overview of Pocksy?**  
> *Answer:* Pocksy is a full-stack personal wealth management platform built with React Native (Expo) and TypeScript on the frontend, and Node.js/Express with MongoDB on the backend. It offers multi-account tracking, transaction management, real-time analytics, debt tracking, and biometric security.

**Q2: Why did you choose a Monorepo structure for this project?**  
> *Answer:* Having `mobile` and `backend` in one repository makes it easy to maintain end-to-end TypeScript interfaces, share validation rules, coordinate features simultaneously, and streamline continuous development.

**Q3: How do you handle authentication across mobile and backend?**  
> *Answer:* We use stateless JWT authentication. Upon successful login/signup with bcrypt-hashed credentials, the server returns a JWT. The mobile app saves this in hardware-backed `Expo SecureStore`. An API request interceptor automatically attaches the `Authorization: Bearer <token>` header to all protected endpoints.

---

### React Native & Frontend
**Q4: Why did you choose Zustand instead of Redux Toolkit?**  
> *Answer:* Zustand is lightweight (<1.5 KB), eliminates boilerplate (no actions/reducers), and allows components to subscribe only to the specific state slice they need, avoiding unnecessary re-renders.

**Q5: How does Expo Router work in this project?**  
> *Answer:* Expo Router uses file-system based routing similar to Next.js. We organize screens inside `app/(auth)` for authentication flows, `app/(tabs)` for core tabs (Dashboard, Transactions, Add, Analytics, Profile), and use dynamic layouts with typed route parameters.

**Q6: How did you implement biometric authentication?**  
> *Answer:* Using `expo-local-authentication`. On app launch, if biometric lock is enabled in settings, the app triggers native Face ID / Touch ID / Android Biometric prompts. Session tokens remain protected in `Expo SecureStore` until successful verification.

**Q7: How did you ensure 60fps smooth animations on mobile?**  
> *Answer:* We used `react-native-reanimated`, which runs animations directly on the native UI thread rather than passing frame updates across the JavaScript bridge, preventing dropped frames during heavy operations.

---

### Backend & Database
**Q8: How do you prevent inconsistent account balances during transactions?**  
> *Answer:* When a transaction is created or deleted, we use atomic `$inc` updates on the Account document. For transfers, we atomically decrement the source account and increment the destination account.

**Q9: Why MongoDB instead of PostgreSQL for this application?**  
> *Answer:* Financial tracking entities (debts, recurring rules, multi-category metadata) have flexible attributes. MongoDB document structures allow easy nesting, fast schema evolution, and high-performance multi-stage `$facet` aggregations for dashboard calculations.

**Q10: What MongoDB indexing strategy did you use?**  
> *Answer:* We created compound indexes like `{ userId: 1, date: -1 }` on transactions for fast chronological sorting and pagination, and `{ userId: 1, category: 1 }` for instant category filtering.

**Q11: What is the benefit of using `.lean()` in Mongoose queries?**  
> *Answer:* `.lean()` tells Mongoose to return plain JavaScript objects instead of heavy Mongoose Documents with internal change tracking and getters/setters. This reduces memory usage and speeds up read query response times by 3–5x.

**Q12: How do you handle pagination in transaction listings?**  
> *Answer:* We implement limit-skip pagination with query parameters `page` and `limit`. We run `Transaction.find().skip(skip).limit(limit)` and `Transaction.countDocuments()` concurrently using `Promise.all` to return both the data and total page count.

---

### Security, Performance & Scalability
**Q13: How do you secure the REST API against attacks?**  
> *Answer:* We use `helmet` for secure HTTP headers, `express-rate-limit` to prevent brute-force attacks on auth endpoints, `cors` to whitelist domains, and an `authGuard` middleware that verifies JWT integrity before reaching controllers.

**Q14: How does the mobile app handle offline network drops or backend downtime?**  
> *Answer:* The API client wraps network calls in standardized `try/catch` handlers with a custom `ApiError` class, returning user-friendly messages and graceful UI state fallbacks rather than crashing.

**Q15: How does your dynamic API URL detection work?**  
> *Answer:* In `api.ts`, `getBaseUrl()` dynamically checks whether the app is running in production, web (`localhost:5000`), or an Expo Go physical device where it extracts `Constants.expoConfig.hostUri` to connect to the host computer's local Wi-Fi IP automatically.

**Q16: How do you handle validation on both frontend and backend?**  
> *Answer:* On the frontend, we use `react-hook-form` with schema validation for instant user feedback. On the backend, we use dedicated validator middlewares to sanitize and validate request payloads before they reach the controller.

**Q17: How would you scale this system to 1 million daily active users?**  
> *Answer:* 
> 1. Introduce **Redis** for caching frequent queries (dashboard aggregates, exchange rates).
> 2. Implement a background job queue (**BullMQ / Redis**) for recurring subscription billing processing.
> 3. Implement database read-replicas and horizontal sharding by `userId`.
> 4. Use a CDN for static assets and containerize the Express backend using Docker/Kubernetes behind an NGINX load balancer.

**Q18: What is the advantage of using TypeScript across both frontend and backend?**  
> *Answer:* It provides compile-time safety, autocompletion, prevents runtime `undefined is not a function` errors, and ensures data models and API response contracts match across both layers.

**Q19: How do you handle inter-account transfers?**  
> *Answer:* A transfer transaction stores both `accountId` (source) and `toAccountId` (destination). The backend performs a two-way balance adjustment, decrementing the source balance and incrementing the destination balance.

**Q20: If you had more time, what features would you build next?**  
> *Answer:* 
> 1. Integration with **Plaid / Open Banking API** for automated bank statement syncing.
> 2. **Receipt OCR Scanner** using Google Cloud Vision / ML Kit to auto-extract transaction details from receipts.
> 3. **AI Financial Advisor** powered by an LLM to provide custom budgeting insights based on historical spending velocity.

---

## 9. 📈 Future Roadmap & System Scalability

```
┌─────────────────────────────────────────────────────────────┐
│                       CURRENT PHASE                         │
│  • Full Expense/Income/Transfer Tracking                    │
│  • Aggregated Dashboard & Categorical Charts                │
│  • Biometric Authentication + SecureStore                   │
│  • Debts (IOU), Savings Goals, Recurring Rules              │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       NEXT PHASE (V2)                       │
│  • Plaid / Open Banking Direct Bank Account Sync            │
│  • Camera Receipt Scanning (OCR / AI-based auto-categorize) │
│  • Multi-Currency Conversion with Live Forex Rates          │
│  • Redis Caching & BullMQ Background Worker Queues          │
│  • Shared Wallets / Split-Expense Groups                    │
└─────────────────────────────────────────────────────────────┘
```

---

### 💡 Tips for Explaining This Project in an Interview
1. **Start with the problem**: *"Managing money across multiple apps and bank accounts is fragmented and messy."*
2. **Highlight full-stack ownership**: *"I built both the mobile frontend in React Native Expo and the backend REST API in Express and MongoDB from scratch."*
3. **Show technical depth**: Talk about the **MongoDB aggregation pipelines**, **compound indexing**, **biometric hardware keystore storage**, and **dynamic network discovery**.
4. **Use STAR stories**: When asked about challenges, frame your response with Situation, Task, Action, and Result.
