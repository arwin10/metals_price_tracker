'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        // Get user from localStorage
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userData || !token) {
          router.push('/login');
          return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Set the Supabase session with the token
        await supabase.auth.setSession({
          access_token: token,
          refresh_token: '', // We only need the access token for this
        });

        // Fetch latest profile data from Supabase
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', parsedUser.id)
          .single();

        if (error) {
          console.error('Profile fetch error:', error);
          // If we can't fetch the profile, use the data from localStorage as fallback
          setProfile({
            id: parsedUser.id,
            email: parsedUser.email,
            first_name: parsedUser.firstName || parsedUser.first_name || '',
            last_name: parsedUser.lastName || parsedUser.last_name || '',
            role: parsedUser.role || 'user',
            preferred_currency: parsedUser.preferredCurrency || parsedUser.preferred_currency || 'INR',
            notification_enabled: parsedUser.notificationEnabled !== undefined ? parsedUser.notificationEnabled : true,
          });
        } else {
          setProfile({
            id: (data as any)?.id || '',
            email: (data as any)?.email || '',
            first_name: (data as any)?.first_name || null,
            last_name: (data as any)?.last_name || null,
            role: (data as any)?.role || 'user',
            preferred_currency: (data as any)?.preferred_currency || 'INR',
            notification_enabled: (data as any)?.notification_enabled !== undefined ? (data as any).notification_enabled : true,
            created_at: (data as any)?.created_at || '',
            updated_at: (data as any)?.updated_at || '',
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        // Fallback to localStorage data
        try {
          const userData = localStorage.getItem('user');
          if (userData) {
            const parsedUser = JSON.parse(userData);
            setProfile({
              id: parsedUser.id,
              email: parsedUser.email,
              first_name: parsedUser.firstName || parsedUser.first_name || '',
              last_name: parsedUser.lastName || parsedUser.last_name || '',
              role: parsedUser.role || 'user',
              preferred_currency: parsedUser.preferredCurrency || parsedUser.preferred_currency || 'INR',
              notification_enabled: parsedUser.notificationEnabled !== undefined ? parsedUser.notificationEnabled : true,
            });
          }
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
        }
        setError('Failed to load profile data from server, showing cached data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      // Get token from localStorage and set session
      const token = localStorage.getItem('token');
      if (token) {
        await supabase.auth.setSession({
          access_token: token,
          refresh_token: '',
        });
      }

      const { error } = await (supabase as any)
        .from('users')
        .update({
          first_name: profile.first_name || null,
          last_name: profile.last_name || null,
          preferred_currency: profile.preferred_currency || 'INR',
          notification_enabled: profile.notification_enabled !== undefined ? profile.notification_enabled : true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id || profile?.id);

      if (error) {
        throw error;
      }

      setSuccess('Profile updated successfully!');
      
      // Update localStorage with new data
      const updatedUser = {
        ...user,
        firstName: profile.first_name,
        lastName: profile.last_name,
        preferredCurrency: profile.preferred_currency,
        notificationEnabled: profile.notification_enabled,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(`Failed to update profile: ${err.message || 'Unknown error'}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="card max-w-4xl w-full mx-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="md:col-span-2 h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="card max-w-4xl w-full mx-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Link href="/" className="btn-primary inline-block">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Profile</h1>
          <button
            onClick={handleLogout}
            className="btn-secondary"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="card lg:col-span-1">
            <div className="text-center py-8">
              <div className="mx-auto bg-gray-200 dark:bg-gray-700 border-2 border-dashed rounded-xl w-24 h-24 flex items-center justify-center mb-4">
                <span className="text-3xl">
                  {profile?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {profile?.first_name} {profile?.last_name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {profile?.role || 'user'}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="card lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Profile Information</h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={profile?.first_name || ''}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    placeholder="First name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={profile?.last_name || ''}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    placeholder="Last name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="input-field"
                  value={user?.email || ''}
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Currency
                </label>
                <select
                  className="input-field"
                  value={profile?.preferred_currency || 'USD'}
                  onChange={(e) => setProfile({ ...profile, preferred_currency: e.target.value })}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifications"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={profile?.notification_enabled || false}
                  onChange={(e) => setProfile({ ...profile, notification_enabled: e.target.checked })}
                />
                <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Enable price notifications
                </label>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/prices')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Account Statistics */}
        <div className="card mt-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Account Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">0</div>
              <div className="text-gray-600 dark:text-gray-400">Portfolios</div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">0</div>
              <div className="text-gray-600 dark:text-gray-400">Alerts Set</div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">0</div>
              <div className="text-gray-600 dark:text-gray-400">Holdings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}