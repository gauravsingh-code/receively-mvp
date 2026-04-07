'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import { api } from '@/lib/api/client';

export default function Home() {
  const [apiStatus, setApiStatus] = useState('checking...');

  useEffect(() => {
    // Check API connection
    api.health()
      .then((data) => setApiStatus('✅ Connected'))
      .catch(() => setApiStatus('❌ Disconnected'));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">Receively</h1>
            <div className="text-sm text-gray-600">
              API: {apiStatus}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4">
            Welcome to Receively
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Your simple and modern invoice management solution
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg">Get Started</Button>
            <Button variant="outline" size="lg">Learn More</Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">📝 Easy Invoicing</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create and manage invoices in seconds with our intuitive interface.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">📊 Track Payments</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Keep track of all your payments and outstanding invoices in one place.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">🚀 Fast & Simple</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Built with modern technology for speed and reliability.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-bold">Tech Stack</h3>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">Frontend</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>✓ Next.js 16 (App Router)</li>
                  <li>✓ React 19</li>
                  <li>✓ Tailwind CSS 4</li>
                  <li>✓ JavaScript (ES6+)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Backend</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>✓ Node.js + Express</li>
                  <li>✓ Clean Architecture</li>
                  <li>✓ JWT Authentication</li>
                  <li>✓ RESTful API</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-16 border-t">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600">
            Built with ❤️ using Next.js and Node.js
          </p>
        </div>
      </footer>
    </div>
  );
}
