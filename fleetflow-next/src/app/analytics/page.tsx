'use client';

import React from 'react';
import { BarChart3, TrendingUp, Download, Calendar, Fuel, TrendingDown, Gauge, ChevronDown } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, LineController, BarController } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import Layout from '../../components/Layout';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, LineController, BarController);

const RANGE_OPTIONS = [
    { label: 'Last 7 Days', value: '7' },
    { label: 'Last 30 Days', value: '30' },
    { label: 'Last 90 Days', value: '90' },
    { label: 'All Time', value: 'all' },
];

const Analytics: React.FC = () => {
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [range, setRange] = React.useState<string>('30');
    const [isRangeOpen, setIsRangeOpen] = React.useState(false);
    const [exporting, setExporting] = React.useState(false);

    React.useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const params = range !== 'all' ? `?range=${range}` : '';
                const res = await api.get(`/analytics/overall${params}`);
                setData(res.data);
            } catch (err) {
                console.error('Failed to fetch analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [range]);

    const selectedRangeLabel = RANGE_OPTIONS.find(o => o.value === range)?.label || 'Last 30 Days';

    const handleExport = () => {
        if (!data) return;
        setExporting(true);
        try {
            const rows = [
                ['Month', 'Revenue (INR)', 'Fuel Cost (INR)', 'Maintenance (INR)', 'Net Profit (INR)'],
                ...data.monthlyFinancials.map((r: any) => [
                    r.month,
                    r.revenue,
                    r.fuelCost,
                    r.maintenance,
                    r.netProfit
                ]),
                [],
                ['KPI Summary'],
                ['Total Revenue', data.kpis?.totalRevenue],
                ['Total Fuel Cost', data.kpis?.totalFuelCost],
                ['Total Maintenance', data.kpis?.totalMaintenance],
                ['Fleet ROI (%)', data.kpis?.overallROI],
                ['Utilization Rate (%)', data.kpis?.utilizationRate],
            ];
            const csv = rows.map(r => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `FleetFlow_Analytics_${selectedRangeLabel.replace(/ /g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setExporting(false);
        }
    };

    const kpis = data?.kpis;
    const roi = parseFloat(kpis?.overallROI || '0');

    const fuelLineData = {
        labels: data?.fuelTrend?.labels || [],
        datasets: [{
            label: 'Fuel Efficiency (km/L)',
            data: data?.fuelTrend?.data || [],
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#2563eb',
            pointRadius: 4,
        }]
    };

    const costliestBarData = {
        labels: data?.costliestVehicles?.map((v: any) => v.name) || [],
        datasets: [{
            label: 'Total Op. Cost (₹)',
            data: data?.costliestVehicles?.map((v: any) => v.totalCost) || [],
            backgroundColor: [
                'rgba(239, 68, 68, 0.75)',
                'rgba(245, 158, 11, 0.75)',
                'rgba(168, 85, 247, 0.75)',
                'rgba(37, 99, 235, 0.75)',
                'rgba(100, 116, 139, 0.75)',
            ],
            borderRadius: 8,
            borderWidth: 0,
        }]
    };

    const barOptions = {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: {
                ticks: { callback: (v: any) => `₹${(v / 1000).toFixed(0)}k` },
                grid: { color: '#f1f5f9' }
            },
            x: { grid: { display: false } }
        }
    };

    const lineOptions = {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { grid: { color: '#f1f5f9' } },
            x: { grid: { display: false } }
        }
    };

    return (
        <Layout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Operational Analytics</h1>
                        <p className="text-slate-500 text-sm font-medium mt-0.5">Financial reports & fleet performance insights</p>
                    </div>
                    <div className="flex gap-3">
                        {/* Date Range Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsRangeOpen(v => !v)}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold flex items-center gap-2 text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                <Calendar size={18} />
                                {selectedRangeLabel}
                                <ChevronDown size={15} className={`transition-transform duration-200 ${isRangeOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {isRangeOpen && (
                                    <>
                                        <div className="fixed inset-0 z-20" onClick={() => setIsRangeOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            className="absolute left-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl border border-slate-100 p-1.5 z-30"
                                        >
                                            {RANGE_OPTIONS.map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => { setRange(opt.value); setIsRangeOpen(false); }}
                                                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-all ${range === opt.value ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Export Button */}
                        <button
                            onClick={handleExport}
                            disabled={exporting || !data}
                            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={18} className={exporting ? 'animate-bounce' : ''} />
                            {exporting ? 'Exporting...' : 'Export Report'}
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Fuel Cost */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                            <Fuel size={22} className="text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Fuel Cost</p>
                            {loading ? (
                                <div className="h-7 w-28 bg-slate-100 rounded animate-pulse" />
                            ) : (
                                <p className="text-2xl font-bold text-slate-900">₹{(kpis?.totalFuelCost || 0).toLocaleString('en-IN')}</p>
                            )}
                        </div>
                    </div>

                    {/* Fleet ROI */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${roi >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                            {roi >= 0
                                ? <TrendingUp size={22} className="text-emerald-500" />
                                : <TrendingDown size={22} className="text-red-500" />
                            }
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fleet ROI</p>
                            {loading ? (
                                <div className="h-7 w-24 bg-slate-100 rounded animate-pulse" />
                            ) : (
                                <p className={`text-2xl font-bold ${roi >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {roi >= 0 ? '+' : ''}{kpis?.overallROI || 0}%
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Utilization Rate */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                            <Gauge size={22} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Utilization Rate</p>
                            {loading ? (
                                <div className="h-7 w-20 bg-slate-100 rounded animate-pulse" />
                            ) : (
                                <p className="text-2xl font-bold text-slate-900">{kpis?.utilizationRate || 0}%</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Fuel Efficiency Trend */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-slate-900">Fuel Efficiency Trend</h3>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">km per litre, by month</p>
                            </div>
                            <TrendingUp size={20} className="text-primary" />
                        </div>
                        <div className="h-[270px]">
                            {loading
                                ? <div className="h-full bg-slate-50 rounded-xl animate-pulse" />
                                : <Line data={fuelLineData} options={lineOptions} />
                            }
                        </div>
                    </div>

                    {/* Top 5 Costliest Vehicles */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-slate-900">Top 5 Costliest Vehicles</h3>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Total fuel + maintenance spend</p>
                            </div>
                            <BarChart3 size={20} className="text-slate-400" />
                        </div>
                        <div className="h-[270px]">
                            {loading
                                ? <div className="h-full bg-slate-50 rounded-xl animate-pulse" />
                                : data?.costliestVehicles?.length === 0
                                    ? <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">No operational data yet</div>
                                    : <Bar data={costliestBarData} options={barOptions} />
                            }
                        </div>
                    </div>
                </div>

                {/* Monthly Financial Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900">Monthly Financial Summary</h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Revenue, costs, and net profit by month</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Month</th>
                                    <th className="px-6 py-4">Revenue</th>
                                    <th className="px-6 py-4">Fuel Cost</th>
                                    <th className="px-6 py-4">Maintenance</th>
                                    <th className="px-6 py-4">Net Profit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center italic text-slate-400">Loading financial data...</td></tr>
                                ) : !data?.monthlyFinancials?.length ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center italic text-slate-400">No completed trips data available yet</td></tr>
                                ) : data.monthlyFinancials.map((row: any) => (
                                    <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">{row.month}</td>
                                        <td className="px-6 py-4 text-emerald-600 font-semibold">₹{(row.revenue || 0).toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4 text-slate-600">₹{(row.fuelCost || 0).toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4 text-slate-600">₹{(row.maintenance || 0).toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold ${row.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {row.netProfit >= 0 ? '+' : ''}₹{(row.netProfit || 0).toLocaleString('en-IN')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Vehicle ROI Report */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900">Vehicle ROI Report</h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Revenue vs. operational cost per asset</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-medium text-sm">
                            <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Asset</th>
                                    <th className="px-6 py-4">Acquisition Cost</th>
                                    <th className="px-6 py-4">Op. Costs (Fuel + Maint.)</th>
                                    <th className="px-6 py-4">Revenue Generated</th>
                                    <th className="px-6 py-4">ROI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center italic text-slate-400">Harvesting operational data...</td></tr>
                                ) : !data?.roiReport?.length ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center italic text-slate-400">No asset data available for ROI analysis</td></tr>
                                ) : data.roiReport.map((item: any) => {
                                    const roiVal = parseFloat(item.roi);
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-primary">{item.id}</td>
                                            <td className="px-6 py-4">₹{(item.acquisitionCost).toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-4">₹{(item.opCosts).toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-4 text-emerald-600 font-bold">₹{parseFloat(item.revenue).toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold ${item.roi === 'Inf' || roiVal >= 1 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {item.roi === 'Inf' ? '∞' : `${roiVal.toFixed(2)}x`}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default Analytics;
