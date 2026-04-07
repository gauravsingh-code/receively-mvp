# Receively Frontend

Modern Next.js frontend for Receively invoice management app.

## 🚀 Quick Start

```bash
# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

Visit: http://localhost:3001

## 📁 Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── layout.js         # Root layout
│   ├── page.js           # Home page
│   └── globals.css       # Global styles
│
├── components/           # React components
│   └── ui/              # UI components
│       ├── Button.js
│       ├── Card.js
│       └── Input.js
│
└── lib/                 # Utilities & helpers
    ├── api/
    │   └── client.js    # API client
    ├── config.js        # App configuration
    └── utils.js         # Helper functions
```

## 🎨 Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS 4** - Styling
- **JavaScript** - No TypeScript

## 🔗 API Connection

Frontend connects to backend API at: `http://localhost:4000`

Configure in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 📝 Available Scripts

- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Features

- ✅ API client configured
- ✅ Reusable UI components (Button, Card, Input)
- ✅ Utility functions (date, currency formatting)
- ✅ Environment configuration
- ✅ Clean folder structure
- ✅ Tailwind CSS setup
- ✅ Dark mode ready

## 🔨 Creating Pages

```javascript
// app/dashboard/page.js
export default function Dashboard() {
  return <div>Dashboard</div>;
}
```

## 🎨 Using Components

```javascript
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';

export default function MyPage() {
  return (
    <Card>
      <CardHeader>
        <h2>Title</h2>
      </CardHeader>
      <CardContent>
        <Button onClick={() => alert('Clicked!')}>
          Click Me
        </Button>
      </CardContent>
    </Card>
  );
}
```

## 🌐 API Usage

```javascript
import { api } from '@/lib/api/client';

// GET request
const data = await api.get('/api/invoices');

// POST request
const result = await api.post('/api/invoices', {
  title: 'Invoice #1',
  amount: 100,
});
```

## 📦 Next Steps

1. Create authentication pages (`/login`, `/signup`)
2. Add dashboard pages
3. Build invoice management features
4. Add user profile management
5. Integrate with backend API

Happy coding! 🎉

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
