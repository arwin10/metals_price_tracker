'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send password reset email');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="card max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Reset Password
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p>Password reset email sent successfully!</p>
            <p className="mt-2">Please check your email and follow the instructions to reset your password.</p>
            <Link href="/login" className="mt-4 btn-primary inline-block px-4 py-2 text-center">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Remember your password?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-500 font-semibold">
            Sign in
          </Link>
        </p>

        <div className="mt-6">
          <Link href="/" className="text-center block text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}