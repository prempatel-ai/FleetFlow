'use client';

import React from 'react';
import { BarChart3, TrendingUp, PieChart, Download, Calendar } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, LineController, PieController } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import api from '../../utils/api';
import Layout from '../../components/Layout';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, LineController, PieController);

const Analytics: React.FC = () => {
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/analytics/overall');
                setData(res.data);
            } catch (err) {
                console.error('Failed to fetch analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const fuelData = {
        labels: data?.fuelTrend?.labels || [],
        datasets: [{
            label: 'Fuel Efficiency (km/L)',
            data: data?.fuelTrend?.data || [],
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    const utilizationData = {
        labels: ['Active', 'In Shop', 'Available', 'Retired'],
        datasets: [{
            data: data ? [
                data.utilization.active,
                data.utilization.inShop,
                data.utilization.available,
                data.utilization.retired
            ] : [0, 0, 0, 0],
            backgroundColor: ['#2563eb', '#ef4444', '#10b981', '#64748b'],
            borderWidth: 0
        }]
    };

    return (
        <Layout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Operational Analytics</h1>
                        <p className="text-slate-500 text-sm font-medium">Data-driven performance insights</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold flex items-center gap-2 text-slate-600 hover:bg-slate-50">
                            <Calendar size={18} />
                            Last 30 Days
                        </button>
                        <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/10">
                            <Download size={18} />
                            Export Audit
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-slate-900">Fuel Efficiency Trends</h3>
                            <TrendingUp size={20} className="text-primary" />
                        </div>
                        <div className="h-[300px]">
                            <Line data={fuelData} options={{ maintainAspectRatio: false }} />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-slate-900">Fleet Utilization</h3>
                            <PieChart size={20} className="text-slate-400" />
                        </div>
                        <div className="h-[300px] flex justify-center">
                            <div className="w-[300px]">
                                <Pie data={utilizationData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
                        <h3 className="font-bold text-slate-900 mb-8">Vehicle ROI Report</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-medium text-sm">
                                <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Asset ID</th>
                                        <th className="px-6 py-4">Acquisition Cost</th>
                                        <th className="px-6 py-4">Op. Costs (Fuel + Main)</th>
                                        <th className="px-6 py-4">Revenue Gen.</th>
                                        <th className="px-6 py-4">ROI %</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 italic text-sm text-slate-300">
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-6 py-20 text-center">Harvesting operational data...</td></tr>
                                    ) : data?.roiReport.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-20 text-center">No asset data available for ROI analysis</td></tr>
                                    ) : data?.roiReport.map((item: any) => (
                                        <tr key={item.id} className="not-italic text-slate-700 hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-primary">{item.id}</td>
                                            <td className="px-6 py-4">₹{(item.acquisitionCost).toLocaleString()}</td>
                                            <td className="px-6 py-4">₹{(item.opCosts).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-success font-bold">₹{parseFloat(item.revenue).toLocaleString()}</td>
                                            <td className="px-6 py-4 font-bold text-slate-900 uppercase">{item.roi}x</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Analytics;
