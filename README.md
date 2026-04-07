# Receively MVP

Monorepo for Receively - Simple invoice management application.

## 🏗️ Project Structure

```
receively-mvp/
├── apps/
│   ├── api/          # Express.js Backend (Port 4000)
│   └── web/          # Next.js Frontend (Port 3001)
```

## 🚀 Quick Start

### 1. Start Backend (API)
```bash
cd apps/api
npm install
cp .env.example .env
npm run dev
```
Backend runs at: http://localhost:4000

### 2. Start Frontend (Web)
```bash
cd apps/web
npm install
# .env.local already configured
npm run dev
```
Frontend runs at: http://localhost:3001

## 📦 Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│   Next.js Frontend  │  HTTP   │   Express Backend    │
│   (Port 3001)       │ ◄─────► │   (Port 4000)        │
│                     │         │                      │
│ - React Components  │         │ - REST API           │
│ - Tailwind CSS      │         │ - Business Logic     │
│ - API Client        │         │ - Database           │
└─────────────────────┘         └──────────────────────┘
```

## 🎨 Tech Stack

### Frontend (`apps/web`)
- **Next.js 16** - React framework
- **React 19** - UI library
- **Tailwind CSS 4** - Styling
- **JavaScript** - ES6+ modules

### Backend (`apps/api`)
- **Node.js** - Runtime
- **Express.js** - Web framework
- **JavaScript** - ES6+ modules
- **Zod** - Validation
- **JWT** - Authentication

## 📝 Features

- ✅ Clean folder structure
- ✅ Modern JavaScript (no TypeScript)
- ✅ Hot reload in development
- ✅ API client configured
- ✅ Reusable UI components
- ✅ Error handling
- ✅ Environment configuration
- ✅ CORS configured
- ✅ Security with Helmet

## 🔗 API Endpoints

Health check: http://localhost:4000/health

## 📚 Documentation

- [API Documentation](apps/api/README.md)
- [Frontend Documentation](apps/web/README.md)

## 🛠️ Development

Both applications support hot reload:
- API: Changes to `.js` files auto-restart server
- Web: Changes to components/pages auto-refresh browser

## 🚢 Deployment

### Backend
- Deploy to: Heroku, Railway, Render, etc.
- Requires: Node.js environment

### Frontend
- Deploy to: Vercel, Netlify, etc.
- Update `NEXT_PUBLIC_API_URL` to production API URL

## 📦 Next Steps

1. ✅ Setup complete
2. ⬜ Add database (PostgreSQL/MongoDB)
3. ⬜ Implement authentication
4. ⬜ Build invoice features
5. ⬜ Add user management
6. ⬜ Deploy to production

Happy coding! 🎉
