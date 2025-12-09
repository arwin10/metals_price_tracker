'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import axios from 'axios';

interface DashboardStats {
    users: number;
    portfolios: number;
    holdings: number;
    alerts: {
        total: number;
        active: number;
    };
}

interface SystemStatus {
    status: string;
    timestamp: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [system, setSystem] = useState<SystemStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const response = await axios.get('http://localhost:5001/api/admin/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setStats(response.data.stats);
                setSystem(response.data.system);
                setLoading(false);
            } catch (err: any) {
                console.error('Error fetching admin stats:', err);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    setError('Unauthorized. You must be an admin to view this page.');
                } else {
                    setError('Failed to load dashboard data.');
                }
                setLoading(false);
            }
        };

        fetchStats();
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Admin Dashboard
                </h1>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-xl text-gray-500">Loading dashboard...</div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
                        {error}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* User Stats */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Users</h3>
                                <span className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                    👥
                                </span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.users}</p>
                        </div>

                        {/* Portfolio Stats */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Portfolios</h3>
                                <span className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                    💼
                                </span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.portfolios}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                {stats?.holdings} total holdings
                            </p>
                        </div>

                        {/* Alert Stats */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Price Alerts</h3>
                                <span className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
                                    🔔
                                </span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.alerts.total}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                {stats?.alerts.active} active
                            </p>
                        </div>

                        {/* System Status */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">System Status</h3>
                                <span className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                                    🖥️
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${system?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{system?.status}</p>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 truncate">
                                Last updated: {new Date(system?.timestamp || '').toLocaleTimeString()}
                            </p>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}
