'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import ExportButton from '../../../components/ExportButton';
import axios from 'axios';

export default function PortfolioDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [portfolio, setPortfolio] = useState<any>(null);
    const [holdings, setHoldings] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const response = await axios.get(`http://localhost:5001/api/portfolio/${params.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setPortfolio(response.data.portfolio);
                setHoldings(response.data.holdings);
                setSummary(response.data.summary);
                setLoading(false);
            } catch (err: any) {
                console.error('Error fetching portfolio:', err);
                setError('Failed to load portfolio details.');
                setLoading(false);
            }
        };

        fetchPortfolio();
    }, [params.id, router]);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="flex justify-center items-center h-64">
                <div className="text-xl text-gray-500">Loading portfolio...</div>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {portfolio?.name}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {portfolio?.description}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <ExportButton portfolioName={portfolio?.name || 'Portfolio'} holdings={holdings} />
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="btn-secondary"
                        >
                            Back
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Value</h3>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            ${summary?.totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Invested</h3>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            ${summary?.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Return</h3>
                        <div className={`text-3xl font-bold ${summary?.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {summary?.totalGain >= 0 ? '+' : ''}
                            ${summary?.totalGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <span className="text-sm ml-2 font-medium">
                                ({summary?.totalGainPercentage.toFixed(2)}%)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Holdings Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Holdings</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Metal</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Purchase Price</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Value</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Return</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {holdings.map((holding: any) => (
                                    <tr key={holding.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap capitalize font-medium text-gray-900 dark:text-white">
                                            {holding.metal_type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(holding.purchase_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {holding.quantity} {holding.unit}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            ${holding.purchase_price.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            ${holding.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${holding.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {holding.gain >= 0 ? '+' : ''}{holding.gainPercentage.toFixed(2)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {holdings.length === 0 && (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No holdings in this portfolio yet.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
