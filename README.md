# Pocksy

**Know Your Money. Own Your Spending.**

Premium personal finance and expense tracker for Android & iOS.

## Tech Stack

### Mobile
- React Native + Expo (SDK 57)
- TypeScript
- Expo Router
- Zustand (state)
- React Hook Form + Zod (validation)

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT + bcrypt

## Project Structure

```
pocksy/
├── mobile/          # React Native Expo app
│   ├── src/
│   │   ├── app/     # Expo Router screens
│   │   ├── components/ui/  # Reusable components
│   │   ├── constants/      # Theme, categories, currency
│   │   ├── store/          # Zustand stores
│   │   ├── types/          # TypeScript interfaces
│   │   └── hooks/          # Custom hooks
│   └── assets/
├── backend/         # Express API
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       └── validators/
```

## Getting Started

### Backend
```bash
cd backend
cp .env.example .env   # Edit with your MongoDB URI
npm install
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

## Development Phases

- [x] Phase 1: Foundation
- [ ] Phase 2: Authentication
- [ ] Phase 3: Expense CRUD
- [ ] Phase 4: Income
- [ ] Phase 5: Dashboard
- [ ] Phase 6: Budget
- [ ] Phase 7: Search & Filters
- [ ] Phase 8: Analytics
- [ ] Phase 9+: Advanced features
