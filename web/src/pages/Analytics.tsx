import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  Zap,
  Droplets,
  Thermometer,
  MoreHorizontal
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { cn } from '../lib/utils';
import type { Property } from '../api';

// --- Mock Data ---
const performanceData = [
  { name: 'Mon', active: 42, resolved: 35 },
  { name: 'Tue', active: 58, resolved: 40 },
  { name: 'Wed', active: 45, resolved: 55 },
  { name: 'Thu', active: 65, resolved: 45 },
  { name: 'Fri', active: 50, resolved: 60 },
  { name: 'Sat', active: 30, resolved: 25 },
  { name: 'Sun', active: 25, resolved: 20 },
];

const riskDistributionData = [
  { name: 'Low Risk', value: 320, color: '#10b981' },
  { name: 'Medium Risk', value: 85, color: '#f59e0b' },
  { name: 'High Risk', value: 24, color: '#ef4444' },
];

const energyData = [
    { time: '00:00', kwh: 12 }, { time: '04:00', kwh: 8 }, 
    { time: '08:00', kwh: 45 }, { time: '12:00', kwh: 38 }, 
    { time: '16:00', kwh: 52 }, { time: '20:00', kwh: 65 }, 
    { time: '23:59', kwh: 30 }
];

export default function Analytics() {
    const [timeRange, setTimeRange] = useState('7d');
    const [properties, setProperties] = useState<Property[]>([]);

    useEffect(() => {
        // Mock fetch to get total property count for KPIs
        fetch('http://localhost:8000/properties')
            .then(res => res.json())
            .then(data => setProperties(data))
            .catch(err => console.error(err));
    }, []);

    const kpis = [
        { label: 'Total Tickets', value: '1,248', change: '+12%', trend: 'up', target: '1.2k', status: 'On Track' },
        { label: 'Avg Resolution Time', value: '4.2h', change: '-18%', trend: 'down', target: '5.0h', status: 'Excellent' },
        { label: 'Critical Alerts', value: '24', change: '+2', trend: 'up', target: '0', status: 'Action Req' },
        { label: 'Tenant Satisfaction', value: '4.8/5', change: '+0.1', trend: 'up', target: '4.5', status: 'Exceeding' },
        { label: 'Energy Usage', value: '452 kWh', change: '-5%', trend: 'down', target: '480', status: 'Efficient' },
        { label: 'Maintenance Cost', value: 'Â£12.4k', change: '-2%', trend: 'down', target: 'Â£12.5k', status: 'On Budget' },
    ];

  return (
    <div className="pb-10 space-y-8 max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics Overview</h1>
                <p className="text-slate-500 dark:text-slate-400">Performance metrics and portfolio insights</p>
            </div>
            <div className="flex items-center space-x-3">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    {(['24h', '7d', '30d', '90d'] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                timeRange === range 
                                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            )}
                        >
                            {range}
                        </button>
                    ))}
                </div>
                <button className="flex items-center px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                    <Download className="w-4 h-4 mr-2" /> Export Report
                </button>
            </div>
        </div>

        {/* KPI Cards (Regulator Ready) */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {kpis.map((kpi, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate">{kpi.label}</p>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-400 dark:text-slate-500">Target: {kpi.target}</span>
                        <span className={cn(
                            "font-medium px-1.5 py-0.5 rounded",
                            kpi.status === 'Action Req' ? "text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400" :
                            "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400"
                        )}>
                            {kpi.status}
                        </span>
                    </div>
                </div>
            ))}
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Ticket Volume Trend */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">Ticket Resolution Performance</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Comparing incoming vs resolved tickets</p>
                    </div>
                    <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData} barSize={20}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:opacity-10" />
                            <XAxis 
                                dataKey="name" 
                                tick={{fontSize: 12, fill: '#94a3b8'}} 
                                axisLine={false} 
                                tickLine={false} 
                            />
                            <YAxis 
                                tick={{fontSize: 12, fill: '#94a3b8'}} 
                                axisLine={false} 
                                tickLine={false} 
                            />
                            <RechartsTooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                itemStyle={{ color: '#1e293b' }}
                            />
                            <Legend wrapperStyle={{paddingTop: '20px'}} />
                            <Bar name="Incoming Tickets" dataKey="active" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar name="Resolved Tickets" dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Risk Distribution */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Portfolio Risk Profile</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Current distribution of property risk levels</p>
                
                <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={riskDistributionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {riskDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">7.2%</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">High Risk</span>
                    </div>
                </div>

                <div className="space-y-3 mt-4">
                    {riskDistributionData.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                                <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Energy Consumption Analysis */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center">
                            <Zap className="w-5 h-5 mr-2 text-amber-500" />
                            Energy Consumption Trends
                        </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400 mr-2">Benchmarking vs. Last Year</span>
                        <div className="h-2 w-16 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-2/3"></div>
                        </div>
                    </div>
                </div>
                
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={energyData}>
                            <defs>
                                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:opacity-10" />
                            <XAxis dataKey="time" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                            <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                            <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            <Area type="monotone" dataKey="kwh" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorEnergy)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>

        {/* Recent Alerts List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
             <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Recent Critical Alerts</h3>
                <button className="text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline">View All Alerts</button>
             </div>
             <div>
                {[
                    { type: 'Damp', address: '124 High St, Croydon', time: '14 mins ago', val: '82%', icon: Droplets, color: 'text-blue-500' },
                    { type: 'Temp', address: '42 Maple Ave, Birmingham', time: '1 hour ago', val: '14Â°C', icon: Thermometer, color: 'text-red-500' },
                    { type: 'Power', address: '88 Oak Ln, Manchester', time: '3 hours ago', val: 'Offline', icon: Zap, color: 'text-amber-500' },
                ].map((alert, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b last:border-0 border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center space-x-4">
                            <div className={cn("p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50", alert.color)}>
                                <alert.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white text-sm">{alert.type} Alert</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{alert.address}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-slate-900 dark:text-white">{alert.val}</p>
                            <p className="text-xs text-slate-400">{alert.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

    </div>
  );
}
