'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api/client';
import Button from '@/components/ui/Button';
import {filterNavigation} from '@/config/navigation.js';

// Context to share user data with child pages
const DashboardContext = createContext(null);
export function useDashboard() {
  return useContext(DashboardContext);
}

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Add timeout to prevent infinite loading if API hangs
    const timeout = setTimeout(() => {
      console.error('API call timeout - redirecting to login');
      setLoading(false);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }, 10000); // 10 seconds max

    api.get('/api/auth/profile')
      .then((res) => {
        clearTimeout(timeout);
        setUser(res?.data);
        setLoading(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setLoading(false);
        window.location.href = '/login';
      });

    return () => clearTimeout(timeout); // Cleanup on unmount
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await api.post('/api/auth/logout', { refreshToken });
    } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  // const navItems = [
  //   { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  //   { href: '/dashboard/invoices', icon: '📝', label: 'Invoices' },
  //   { href: '/dashboard/clients', icon: '👥', label: 'Clients' },
  //   { href: '/dashboard/payments', icon: '💳', label: 'Payments' },
  //   { href: '/dashboard/settings', icon: '⚙️', label: 'Settings' },
  // ];

    const navItems = filterNavigation(user);
  return (
    <DashboardContext.Provider value={{ user, setUser }}>
      <div className="min-h-screen flex bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">Receively</h1>
            {user?.business_name && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">{user.business_name}</p>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User footer */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm shrink-0">
                {user?.self_name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user?.self_name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.user_email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
