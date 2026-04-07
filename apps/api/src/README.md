# Receively API

Clean and simple Node.js + Express API structure.

## 📁 Folder Structure

```
src/
├── config/          # App configuration & environment variables
├── models/          # Data models & database schemas
├── controllers/     # Request handlers (business logic)
├── services/        # Reusable business services
├── routes/          # API route definitions
├── middlewares/     # Express middlewares (auth, validation, errors)
├── utils/           # Helper functions & utilities
├── app.js           # Express app setup
└── server.js        # Server entry point
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

## 📝 API Structure

- **Models** - Define your data structure
- **Controllers** - Handle requests, call services
- **Services** - Business logic, data processing
- **Routes** - Map URLs to controllers
- **Middlewares** - Authentication, validation, error handling

## 🎯 Key Features

- ✅ Clean separation of concerns
- ✅ Error handling middleware
- ✅ Environment configuration
- ✅ Security with Helmet & CORS
- ✅ Input validation with Zod
- ✅ JWT authentication ready
- ✅ Simple & easy to understand
