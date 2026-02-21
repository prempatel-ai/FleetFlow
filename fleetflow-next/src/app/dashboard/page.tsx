'use client';

import React, { useState, useEffect } from 'react';
import {
    Activity,
    Wrench,
    BarChart,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    AlertTriangle,
    UserRoundX
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, LineController, PieController } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import { Vehicle, Driver, Trip } from '../../types';

interface StatCardProps {
    title: string;
    value: string | number;
    subValue?: string;
    icon: React.ElementType;
    color: string;
    trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subValue, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
                <Icon size={24} />
            </div>
            {trend !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-success' : 'text-danger'}`}>
                    {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <h3 className="text-slate-500 text-sm font-semibold mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{value}</span>
            {subValue && <span className="text-xs text-slate-400 font-medium">{subValue}</span>}
        </div>
    </div>
);

interface DashboardStats {
    activeFleet: number;
    maintenanceAlerts: number;
    utilizationRate: number;
    idleVehicles: number;
    trends?: {
        activeFleet: number;
        maintenanceAlerts: number;
        utilizationRate: number;
        idleVehicles: number;
    };
}

interface AlertItem {
    id: string;
    title: string;
    description: string;
    type: 'maintenance' | 'license';
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        activeFleet: 0,
        maintenanceAlerts: 0,
        utilizationRate: 0,
        idleVehicles: 0
    });
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, vehiclesRes, driversRes, tripsRes] = await Promise.all([
                    api.get('/analytics/dashboard'),
                    api.get('/vehicles'),
                    api.get('/drivers'),
                    api.get('/trips')
                ]);

                setStats(statsRes.data);
                setTrips(tripsRes.data.slice(0, 5)); // Show last 5 trips

                const proactiveAlerts: AlertItem[] = [];

                vehiclesRes.data.forEach((v: Vehicle) => {
                    if (v.odometer && v.odometer > 15000 && v.status !== 'In Shop') {
                        proactiveAlerts.push({
                            id: `v-${v._id}`,
                            title: `Maintenance Required: ${v.name}`,
                            description: `Odometer reading at ${v.odometer}km. Schedule inspection.`,
                            type: 'maintenance'
                        });
                    }
                });

                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

                driversRes.data.forEach((d: Driver) => {
                    if (d.licenseExpiry) {
                        const expiry = new Date(d.licenseExpiry);
                        if (expiry < thirtyDaysFromNow) {
                            proactiveAlerts.push({
                                id: `d-${d._id}`,
                                title: `License Expiring: ${d.name}`,
                                description: `Expiration date: ${expiry.toLocaleDateString()}. Renewal required.`,
                                type: 'license'
                            });
                        }
                    }
                });

                setAlerts(proactiveAlerts);
            } catch (err) {
                console.error('Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <Layout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Command Center</h1>
                    <p className="text-slate-500 font-medium">Real-time fleet performance at a glance</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Active Fleet"
                        value={stats.activeFleet}
                        subValue="On Trip"
                        icon={Activity}
                        color="bg-primary text-primary"
                        trend={stats.trends?.activeFleet}
                    />
                    <StatCard
                        title="Maintenance Alerts"
                        value={stats.maintenanceAlerts}
                        subValue="In Shop"
                        icon={Wrench}
                        color="bg-danger text-danger"
                        trend={stats.trends?.maintenanceAlerts}
                    />
                    <StatCard
                        title="Utilization Rate"
                        value={`${stats.utilizationRate}%`}
                        subValue="Assigned vs Idle"
                        icon={BarChart}
                        color="bg-accent text-accent"
                        trend={stats.trends?.utilizationRate}
                    />
                    <StatCard
                        title="Idle Vehicles"
                        value={stats.idleVehicles}
                        subValue="Available"
                        icon={Package}
                        color="bg-success text-success"
                        trend={stats.trends?.idleVehicles}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            Recent Trips
                        </h2>
                        <div className="space-y-4">
                            {trips.length === 0 ? (
                                <div className="text-slate-400 text-sm italic py-10 text-center">
                                    No recent trip activity to display
                                </div>
                            ) : trips.map(trip => (
                                <div key={trip._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm">{trip.vehicle?.name}</div>
                                        <div className="text-xs text-slate-500">{trip.startPoint} → {trip.endPoint}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 px-2 py-0.5 bg-white rounded border border-slate-100 inline-block">
                                            {trip.status}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                                            {trip.dispatchDate ? new Date(trip.dispatchDate).toLocaleDateString() : '-'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            Proactive Alerts
                        </h2>
                        <div className="space-y-4">
                            {alerts.length === 0 ? (
                                <div className="text-slate-400 text-sm italic py-10 text-center">
                                    All systems and compliance up to date
                                </div>
                            ) : alerts.map(alert => (
                                <div key={alert.id} className={`p-4 rounded-xl border flex gap-4 ${alert.type === 'maintenance' ? 'bg-danger/5 border-danger/10' : 'bg-accent/5 border-accent/10'
                                    }`}>
                                    <div className={`p-2 rounded-lg shrink-0 ${alert.type === 'maintenance' ? 'text-danger' : 'text-accent'
                                        }`}>
                                        {alert.type === 'maintenance' ? <AlertTriangle size={20} /> : <UserRoundX size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{alert.title}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">{alert.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
