# 🚀 Quick Start Guide

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your configuration

3. **Start development server**
   ```bash
   npm run dev
   ```

   Server will start at http://localhost:3000

## 📂 Project Structure

```
apps/api/
├── src/
│   ├── config/           # Configuration files
│   │   └── index.js      # Main config (env variables)
│   │
│   ├── models/           # Data models
│   │   └── example.model.js
│   │
│   ├── controllers/      # Request handlers
│   │   └── example.controller.js
│   │
│   ├── services/         # Business logic
│   │   └── example.service.js
│   │
│   ├── routes/           # API routes
│   │   └── example.routes.js
│   │
│   ├── middlewares/      # Express middlewares
│   │   ├── errorHandler.js
│   │   └── validate.js
│   │
│   ├── utils/            # Helper functions
│   │   ├── logger.js
│   │   ├── errors.js
│   │   └── asyncHandler.js
│   │
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
│
├── .env.example          # Environment variables template
├── .gitignore
└── package.json
```

## 🎯 How to Build Features

### 1. Create a Model
```javascript
// src/models/user.model.js
export class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
  }
}
```

### 2. Create a Service
```javascript
// src/services/user.service.js
class UserService {
  async create(userData) {
    // Business logic here
    return new User(userData);
  }
}
export default new UserService();
```

### 3. Create a Controller
```javascript
// src/controllers/user.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import userService from '../services/user.service.js';

export const create = asyncHandler(async (req, res) => {
  const user = await userService.create(req.body);
  res.status(201).json({ success: true, data: user });
});
```

### 4. Create Routes
```javascript
// src/routes/user.routes.js
import { Router } from 'express';
import * as controller from '../controllers/user.controller.js';

const router = Router();
router.post('/', controller.create);
export default router;
```

### 5. Register Routes in app.js
```javascript
// src/app.js
import userRoutes from './routes/user.routes.js';

app.use('/api/users', userRoutes);
```

## 🔥 Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm run start:prod` - Start with NODE_ENV=production

## 📝 API Testing

Visit http://localhost:3000/health to test if server is running

## ✨ Features Included

- ✅ Express.js web framework
- ✅ ES6 Modules (import/export)
- ✅ Error handling middleware
- ✅ Request validation with Zod
- ✅ Security with Helmet
- ✅ CORS enabled
- ✅ Environment configuration
- ✅ Logger utility
- ✅ Async error handling
- ✅ Clean folder structure

## 🛠️ Next Steps

1. Set up your database connection
2. Create your models based on your needs
3. Build your API endpoints
4. Add authentication middleware
5. Add validation schemas

Happy coding! 🎉
