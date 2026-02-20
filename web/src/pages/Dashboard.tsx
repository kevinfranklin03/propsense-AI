import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  AlertTriangle, 
  Ticket, 
  Thermometer, 
  Activity,
  Map as MapIcon,
  Zap,
  Clock
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '../lib/utils';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

// Fix Leaflet Icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom Markers for Dashboard Map
const createDotIcon = (color: string) => new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [20, 32], // Smaller for dashboard
    iconAnchor: [10, 32],
    popupAnchor: [1, -30],
    shadowSize: [32, 32]
});

const redIcon = createDotIcon('red');
const orangeIcon = createDotIcon('orange');
const greenIcon = createDotIcon('green');

function getIconForRisk(risk: string) {
    if (risk === 'High') return redIcon;
    if (risk === 'Medium') return orangeIcon;
    return greenIcon;
}

// --- Components ---

function KpiCard({ title, value, icon: Icon, trend, color, warning, subtext }: any) {
  // Extract base color name (e.g., 'blue' from 'text-blue-500')
  const baseColor = color.match(/text-([a-z]+)-/)?.[1] || 'blue';
  
  // Define premium gradient backgrounds based on base color
  const gradients: Record<string, string> = {
    blue: 'from-blue-500/10 to-blue-600/5',
    red: 'from-red-500/10 to-red-600/5',
    amber: 'from-amber-500/10 to-amber-600/5',
    emerald: 'from-emerald-500/10 to-emerald-600/5',
  };

  const bgGradient = gradients[baseColor] || gradients.blue;
  
  // Icon block styling - solid background with white icon for high contrast
  const iconBgClasses: Record<string, string> = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20',
    red: 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/20',
    amber: 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/20',
    emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20',
  };

  const iconBg = iconBgClasses[baseColor] || iconBgClasses.blue;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-5 transition-all duration-300",
      "bg-white dark:bg-slate-900",
      "border border-slate-200 dark:border-slate-800",
      "hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700",
      "group"
    )}>
      {/* Subtle background gradient blob */}
      <div className={cn(
        "absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br blur-3xl opacity-40 transition-opacity group-hover:opacity-60",
        bgGradient
      )}></div>
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</h3>
          </div>
          {subtext && <p className="text-xs text-slate-500 dark:text-slate-500">{subtext}</p>}
        </div>
        
        {/* High contrast icon container */}
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl shadow-lg ring-1 ring-white/10 transition-transform group-hover:scale-110",
          iconBg
        )}>
           <Icon className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Footer / Trend */}
      <div className="relative z-10 mt-5 flex h-6 items-center text-sm font-medium">
        {warning ? (
          <div className="flex w-full items-center justify-between rounded-lg bg-red-50 px-2.5 py-1.5 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
            <span className="flex items-center text-red-600 dark:text-red-400 animate-pulse">
              <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
              {warning}
            </span>
          </div>
        ) : trend ? (
          <div className="flex items-center text-emerald-600 dark:text-emerald-400">
             <Activity className="mr-1.5 h-4 w-4" />
             {trend}
          </div>
        ) : (
          <div className="flex items-center text-slate-400 dark:text-slate-500 text-xs">
             <Clock className="mr-1.5 h-3.5 w-3.5" />
             Updated just now
          </div>
        )}
      </div>
    </div>
  );
}

// Simulated Sparkline Data
const generateSparkline = () => Array.from({ length: 20 }, () => ({ value: 20 + Math.random() * 5 }));

export default function Dashboard({ properties, tickets = [] }: { properties: any[], tickets?: any[] }) {
  const navigate = useNavigate();
  const [riskFilter] = useState<string | null>(null);

  // --- Metrics ---
  const highRiskCount = properties.filter(p => p.risk_level === 'High').length;
  const openTicketsCount = tickets.filter(t => t.status === 'Open').length;

  // Calculate new tickets today
  const newTicketsToday = tickets.filter(t => {
      const ticketDate = new Date(t.created_at);
      const today = new Date();
      return ticketDate.getDate() === today.getDate() &&
             ticketDate.getMonth() === today.getMonth() &&
             ticketDate.getFullYear() === today.getFullYear();
  }).length;
  
  const validTemps = properties.filter(p => p.temp !== undefined);
  const avgTempVal = validTemps.length 
    ? (validTemps.reduce((acc, p) => acc + (p.temp || 0), 0) / validTemps.length)
    : 0;

  // --- Map Center ---
  const validProps = properties.filter(p => p.lat && p.long);
  const mapCenter: [number, number] = validProps.length > 0 
        ? [validProps[0].lat, validProps[0].long] 
        : [51.505, -0.09];

  // --- Filtered List ---
  const displayProps = useMemo(() => {
    let result = [...properties];
    if (riskFilter) result = result.filter(p => p.risk_level === riskFilter);
    return result.sort((a, _) => (a.risk_level === 'High' ? -1 : 1)).slice(0, 5);
  }, [properties, riskFilter]);

  const sparkData = useMemo(() => generateSparkline(), []);

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl mr-3 shadow-lg shadow-amber-500/20">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            Command Centre
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time Portfolio Monitoring • {properties.length} Active Nodes</p>
        </div>
        <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold flex items-center">
             <span className="relative flex h-2 w-2 mr-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             SYSTEM ONLINE
           </div>
           <div className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-3 pr-2">
             {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Row 1: KPIs */}
        <KpiCard 
          title="Portfolio Size" 
          value={properties.length} 
          icon={Building2} 
          color="text-blue-500 dark:text-blue-400" 
          subtext="Total Managed Units"
        />
        <KpiCard 
          title="Critical Alerts" 
          value={highRiskCount} 
          icon={AlertTriangle} 
          color="text-red-500 dark:text-red-400" 
          warning={highRiskCount > 0 ? "Immediate Action Req." : undefined}
          subtext={highRiskCount === 0 ? "All systems normal" : undefined}
        />
        <KpiCard 
          title="Open Tickets" 
          value={openTicketsCount} 
          icon={Ticket} 
          color="text-amber-500 dark:text-amber-400" 
          trend={`${newTicketsToday} New today`}
        />
        <KpiCard 
          title="Avg Temp" 
          value={`${avgTempVal.toFixed(1)}°C`} 
          icon={Thermometer} 
          color="text-emerald-500 dark:text-emerald-400" 
          trend="Stable within bands"
        />

        {/* Row 2: Map & Realtime Graph */}
        
        {/* Map Widget (2 cols) */}
        <div className="md:col-span-2 group relative h-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="absolute top-4 left-4 z-[999] flex items-center rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:text-white">
                <MapIcon className="mr-1.5 h-3.5 w-3.5 text-blue-500 dark:text-blue-400" /> Live View
            </div>
            <MapContainer 
                center={mapCenter} 
                zoom={12} 
                scrollWheelZoom={false}
                zoomControl={false}
                style={{ height: '100%', width: '100%', background: '#f8fafc' }}
                className="z-0 [&_.leaflet-tile-pane]:dark:filter [&_.leaflet-tile-pane]:dark:invert-[.95] [&_.leaflet-tile-pane]:dark:hue-rotate-180 [&_.leaflet-tile-pane]:dark:contrast-[0.9]"
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; OpenStreetMap'
                />
                {validProps.map(prop => (
                    <Marker 
                        key={prop.id} 
                        position={[prop.lat, prop.long]}
                        icon={getIconForRisk(prop.risk_level)}
                    >
                         <Popup className="custom-popup-dark">
                            <div className="text-slate-900 font-sans">
                                <strong>{prop.address}</strong>
                                <br />
                                {prop.tenant_name}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>

        {/* Live Sensor Feed Widget (2 cols) */}
        <div className="md:col-span-2 flex h-[340px] flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center font-semibold text-slate-900 dark:text-white">
                    <Activity className="mr-2 h-4 w-4 text-purple-500 dark:text-purple-400" />
                    Network Activity
                </h3>
                <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    <option>Global Temp</option>
                    <option>Global Humidity</option>
                </select>
            </div>
            
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#8b5cf6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
                 <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 text-center border border-slate-200 dark:border-slate-700/30">
                     <span className="block text-xs text-slate-500">Avg Latency</span>
                     <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">24ms</span>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 text-center border border-slate-200 dark:border-slate-700/30">
                     <span className="block text-xs text-slate-500">Packets/s</span>
                     <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">1.2k</span>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 text-center border border-slate-200 dark:border-slate-700/30">
                     <span className="block text-xs text-slate-500">Uptime</span>
                     <span className="font-mono text-slate-900 dark:text-white font-bold">99.9%</span>
                 </div>
            </div>
        </div>

        {/* Row 3: Live List & Risk Chart */}
        
        {/* Priority List */}
        <div className="md:col-span-3 flex h-[300px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
             <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/20">
                <h3 className="font-semibold text-slate-900 dark:text-white">Priority Watchlist</h3>
                <button className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">View All Properties</button>
             </div>
             <div className="flex-1 overflow-auto p-2">
                 <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                     <thead>
                         <tr className="text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-700/30">
                             <th className="px-4 py-3 font-medium">Property</th>
                             <th className="px-4 py-3 font-medium">Tenant</th>
                             <th className="px-4 py-3 font-medium">Status</th>
                             <th className="px-4 py-3 font-medium">Last Event</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                         {displayProps.map(prop => (
                             <tr key={prop.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group cursor-pointer" onClick={() => navigate(`/properties/${prop.id}`)}>
                                 <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                     {prop.address}
                                 </td>
                                 <td className="px-4 py-3">{prop.tenant_name}</td>
                                 <td className="px-4 py-3">
                                     <span className={cn(
                                         "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                         prop.risk_level === 'High' ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20" :
                                         prop.risk_level === 'Medium' ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" :
                                         "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                     )}>
                                         {prop.risk_level}
                                     </span>
                                 </td>
                                 <td className="px-4 py-3 font-mono text-xs">
                                     {new Date(prop.last_updated).toLocaleTimeString()}
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
        </div>

        {/* Small Risk Donut */}
        <div className="md:col-span-1 relative flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 transition-all shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <h3 className="absolute left-6 top-6 text-sm font-semibold text-slate-500 dark:text-slate-400">Risk Ratio</h3>
            <div className="mt-6 h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={[
                                { name: 'High', value: highRiskCount, color: '#ef4444' },
                                { name: 'Med', value: properties.filter(p => p.risk_level === 'Medium').length, color: '#f59e0b' },
                                { name: 'Low', value: properties.filter(p => p.risk_level === 'Low').length, color: '#10b981' }
                            ].filter(x => x.value > 0)}
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {/* Cells mapped in creation above */}
                            {([
                                { name: 'High', value: highRiskCount, color: '#ef4444' },
                                { name: 'Med', value: properties.filter(p => p.risk_level === 'Medium').length, color: '#f59e0b' },
                                { name: 'Low', value: properties.filter(p => p.risk_level === 'Low').length, color: '#10b981' }
                            ].filter(x => x.value > 0)).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                            itemStyle={{ color: '#f8fafc' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{highRiskCount}</span>
                <span className="block text-xs text-slate-500 uppercase tracking-wider">Critical</span>
            </div>
        </div>

      </div>
    </div>
  );
}
