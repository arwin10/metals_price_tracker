'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    checkAuth();

    // Listen for custom auth-change event
    window.addEventListener('auth-change', checkAuth);

    // Listen for storage events (for multi-tab support)
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('auth-change', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 sticky top-0 z-[999]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400 flex items-center">
            <span className="mr-2">🏆</span>
            <span className="bg-gradient-to-r from-primary-500 to-secondary-600 bg-clip-text text-transparent">
              thegoldprice.in
            </span>
          </Link>

          <div className="hidden md:flex space-x-1 items-center">
            <Link href="/" className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              Home
            </Link>
            <Link href="/prices" className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              All Prices
            </Link>

            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  Dashboard
                </Link>
                <Link href="/portfolio" className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  Portfolio
                </Link>
                <Link href="/alerts" className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  Alerts
                </Link>
                <Link href="/profile" className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-2 btn-secondary rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  Login
                </Link>
                <Link href="/register" className="ml-2 btn-primary rounded-lg">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
