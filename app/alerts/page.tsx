'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AlertsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Price Alerts
        </h1>
      </div>

      <div className="card text-center py-12">
        <div className="text-5xl mb-4">🔔</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Price Alerts
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Get notified when metal prices reach your target levels
        </p>
        <div className="flex justify-center gap-4">
          <button className="btn-primary" disabled>
            Create Alert (Coming Soon)
          </button>
          <Link href="/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="card mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Your Alerts
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            You don&apos;t have any price alerts set up yet.
          </p>
        </div>
      </div>
    </main>
  );
}