/**
 * Authentication Hook
 * Protects pages and provides auth utilities
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth(options = {}) {
  const { requireAuth = true, redirectTo = '/login' } = options;
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('token');
      const hasAuth = !!token;

      setIsAuthenticated(hasAuth);
      setIsLoading(false);

      if (requireAuth && !hasAuth) {
        console.log('useAuth: No authentication found, redirecting to', redirectTo);
        router.replace(redirectTo);
      }
    };

    checkAuth();
  }, [requireAuth, redirectTo, router]);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      router.replace('/login');
    }
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
  };
}
