import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Calendar, 
  Building2, 
  Wrench, 
  Phone, 
  Mail, 
  ShieldAlert, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertOctagon,
  FileText
} from 'lucide-react';
import { 
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { cn } from '../lib/utils';
import type { Property } from '../api';

// --- Types ---
interface SensorReading {
  timestamp: string;
  temp: number;
  humidity: number;
}

interface TimelineEvent {
  type: 'alert' | 'ticket' | 'status';
  message: string;
  timestamp: string;
}

// --- Mock Data Helpers ---
const RISK_CONFIG = {
  High: { 
      color: 'red', 
      text: 'Critical Damp Risk', 
      bg: 'bg-red-500', 
      border: 'border-red-500', 
      lightBg: 'bg-red-50 dark:bg-red-500/10',
      textClass: 'text-red-900 dark:text-red-100',
      subTextClass: 'text-red-600 dark:text-red-300'
  },
  Medium: { 
      color: 'amber', 
      text: 'Monitor Humidity', 
      bg: 'bg-amber-500', 
      border: 'border-amber-500', 
      lightBg: 'bg-amber-50 dark:bg-amber-500/10',
      textClass: 'text-amber-900 dark:text-amber-100',
      subTextClass: 'text-amber-600 dark:text-amber-300'
  },
  Low: { 
      color: 'emerald', 
      text: 'All Systems Healthy', 
      bg: 'bg-emerald-500', 
      border: 'border-emerald-500', 
      lightBg: 'bg-emerald-50 dark:bg-emerald-500/10',
      textClass: 'text-emerald-900 dark:text-emerald-100',
      subTextClass: 'text-emerald-600 dark:text-emerald-300'
  }
};

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [sensorHistory, setSensorHistory] = useState<SensorReading[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallel fetch for demo speed
        const [propRes, sensRes, timeRes] = await Promise.all([
          fetch(`http://localhost:8000/properties/${id}`),
          fetch(`http://localhost:8000/properties/${id}/sensors`),
          fetch(`http://localhost:8000/properties/${id}/timeline`)
        ]);

        if (propRes.ok) setProperty(await propRes.json());
        if (sensRes.ok) setSensorHistory(await sensRes.json());
        if (timeRes.ok) setTimeline(await timeRes.json());
      } catch (err) {
        console.error("Failed to load property details", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) return <div className="p-10 text-center text-slate-500 dark:text-slate-400">Loading Operations Hub...</div>;
  if (!property) return <div className="p-10 text-center text-red-500">Property not found</div>;

  const risk = RISK_CONFIG[property.risk_level as keyof typeof RISK_CONFIG] || RISK_CONFIG.Low;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 text-slate-900 dark:text-slate-200">
      
      {/* Navigation */}
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span className="text-slate-500 dark:text-slate-400">Property #{id}</span>
      </div>

      {/* HEADER: Jumbo Risk Card */}
      <div className={cn(
        "rounded-2xl p-1 overflow-hidden shadow-lg dark:shadow-none border relative", 
        risk.border
      )}>
        {/* Living Gradient Background */}
        <div className={cn("absolute inset-0 opacity-10", risk.bg)}></div>
        
        <div className="bg-white dark:bg-slate-900/90 rounded-xl p-8 relative z-10 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            {/* Left: Risk Badge & Message */}
            <div className="flex items-start space-x-6">
               <div className={cn(
                 "w-24 h-24 rounded-full flex items-center justify-center shadow-lg animate-pulse", 
                 risk.bg
               )}>
                 <ShieldAlert className="w-12 h-12 text-white" />
               </div>
               <div>
                 <h2 className={cn("text-3xl font-black uppercase tracking-tight", risk.textClass)}>
                   {property.risk_level} Risk
                 </h2>
                 <p className={cn("text-xl font-medium mt-1", risk.subTextClass)}>
                   {risk.text}
                 </p>
                 <div className="flex items-center mt-3 text-slate-500 dark:text-slate-400 text-sm">
                   <Clock className="w-4 h-4 mr-1.5" />
                   Last sensor reading: <span className="font-semibold text-slate-900 dark:text-white ml-1">2 mins ago</span>
                 </div>
               </div>
            </div>

            {/* Right: Live Metrics */}
            <div className="flex space-x-8 text-center bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
               <div>
                  <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">Temperature</div>
                  <div className="text-4xl font-bold text-slate-900 dark:text-white flex items-center">
                    20.4°
                    <span className="ml-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded flex items-center">
                      <TrendingUp className="w-3 h-3 mr-0.5" /> Stable
                    </span>
                  </div>
               </div>
               <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
               <div>
                  <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">Humidity</div>
                  <div className="text-4xl font-bold text-slate-900 dark:text-white flex items-center">
                    {property.risk_level === 'High' ? '74%' : '52%'}
                    <span className="ml-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20 px-1.5 py-0.5 rounded flex items-center">
                      <TrendingUp className="w-3 h-3 mr-0.5" /> +4%
                    </span>
                  </div>
               </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-2">
               <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center">
                 <CheckCircle2 className="w-4 h-4 mr-2" />
                 Acknowledge Alert
               </button>
               <button className="px-6 py-3 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 font-bold rounded-lg border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all flex items-center">
                 <AlertOctagon className="w-4 h-4 mr-2" />
                 Escalate Ticket
               </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN (Details & Charts) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Property Details Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-700/50 p-6">
             <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                    {property.address}
                    <button className="ml-3 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-slate-200 dark:border-slate-600 transition-colors">
                      Edit
                    </button>
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-slate-400" /> Birmingham, UK
                  </p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded shadow-sm mr-3">
                      <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">Tenant</p>
                      <p className="font-medium text-slate-900 dark:text-white">{property.tenant_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded shadow-sm mr-3">
                      <Building2 className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">Property Type</p>
                      <p className="font-medium text-slate-900 dark:text-white">2-Bed Flat, 3rd Floor</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded shadow-sm mr-3">
                      <Calendar className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">Tenancy Start</p>
                      <p className="font-medium text-slate-900 dark:text-white">15 March 2018</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded shadow-sm mr-3">
                      <Wrench className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">Last Maintenance</p>
                      <p className="font-medium text-slate-900 dark:text-white">Boiler Service (Oct 2025)</p>
                    </div>
                  </div>
                </div>
             </div>

             {/* Quick Actions Bar */}
             <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 dark:border-slate-700 pt-6">
                <button className="flex-1 min-w-[140px] flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm">
                  <Phone className="w-4 h-4 mr-2 text-slate-400" /> Call Tenant
                </button>
                <button className="flex-1 min-w-[140px] flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm">
                  <Mail className="w-4 h-4 mr-2 text-slate-400" /> Email
                </button>
                <button className="flex-1 min-w-[140px] flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm">
                  <FileText className="w-4 h-4 mr-2" /> New Ticket
                </button>
             </div>
          </div>

          {/* Charts Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-700/50 p-6">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-slate-900 dark:text-white text-lg">Sensor History (24h)</h3>
               <select className="text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-md shadow-sm">
                 <option>Last 24 Hours</option>
                 <option>Last 7 Days</option>
               </select>
            </div>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sensorHistory} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:opacity-10" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(str) => new Date(str).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    tick={{fontSize: 12, fill: '#94a3b8'}}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={30}
                  />
                  <YAxis yAxisId="left" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} domain={[0, 100]} />
                  
                  <RechartsTooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                    itemStyle={{ color: '#1e293b' }}
                  />
                  
                  {/* Threshold Lines */}
                  <ReferenceLine y={18} yAxisId="left" stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideBottomRight', value: 'Min Temp', fill: '#ef4444', fontSize: 10 }} />
                  <ReferenceLine y={60} yAxisId="right" stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'insideBottomRight', value: 'Risk Limit', fill: '#f59e0b', fontSize: 10 }} />

                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorTemp)" 
                  />
                  <Area 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorHum)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center mt-4 space-x-6">
               <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                 <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span> Temperature (°C)
               </div>
               <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                 <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span> Humidity (%)
               </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Tickets & Timeline) */}
        <div className="space-y-8">
          
          {/* Active Tickets */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-700/50 p-6">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-slate-900 dark:text-white text-lg">Active Tickets</h3>
               <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300">View All</button>
             </div>

             <div className="space-y-3">
               {[
                 { id: 'T-247', title: 'Damp on bedroom wall', status: 'Open', due: 'Tomorrow', urgency: 'High' },
                 { id: 'T-239', title: 'Boiler pressure low', status: 'In Progress', due: '3 Oct', urgency: 'Medium' },
                 { id: 'T-231', title: 'Leaking tap', status: 'Resolved', due: '2 days ago', urgency: 'Low' },
               ].map(ticket => (
                 <div key={ticket.id} className="p-3 border border-slate-100 dark:border-slate-700/50 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-mono text-slate-400 group-hover:text-blue-500 transition-colors">#{ticket.id}</span>
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                        ticket.status === 'Open' ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400' :
                        ticket.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' : 'bg-green-100 dark:bg-emerald-500/10 text-green-700 dark:text-emerald-400'
                      )}>{ticket.status}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{ticket.title}</h4>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="w-3 h-3 mr-1" /> Due: {ticket.due}
                    </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Timeline Feed */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-700/50 p-6 h-[500px] overflow-y-auto">
             <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6">Activity Timeline</h3>
             
             <div className="relative pl-4 space-y-8 border-l-2 border-slate-100 dark:border-slate-700">
                {timeline.map((event, i) => (
                  <div key={i} className="relative">
                     <div className={cn(
                       "absolute -left-[21px] mt-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow-sm ring-1",
                       event.type === 'alert' ? "bg-red-500 ring-red-100 dark:ring-red-500/20" :
                       event.type === 'ticket' ? "bg-blue-500 ring-blue-100 dark:ring-blue-500/20" : "bg-slate-400 ring-slate-100 dark:ring-slate-600/20"
                     )}></div>
                     <div className="mb-1">
                       <span className={cn(
                         "text-xs font-bold px-1.5 py-0.5 rounded uppercase tracking-wide",
                         event.type === 'alert' ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10" :
                         event.type === 'ticket' ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10" : "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50"
                       )}>{event.type}</span>
                       <span className="text-xs text-slate-400 ml-2">{new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     </div>
                     <p className="text-sm font-medium text-slate-900 dark:text-white">{event.message}</p>
                  </div>
                ))}
             </div>
          </div>

        </div>
      </div>

    </div>
  );
}
