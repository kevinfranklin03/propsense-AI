import { useState, useEffect } from 'react';
import { 
  Wifi, 
  Droplets, 
  Wind, 
  AlertTriangle, 
  Search, 
  Battery,
  X,
  Activity,
  Flame,
  Home
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchStatus, type StatusResponse } from '../api';

export default function LiveSensors() {
  const [statusRes, setStatusRes] = useState<StatusResponse | null>(null);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'alert' | 'offline'>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
        fetchStatus()
        .then(data => {
            setStatusRes(data);
            setIsLoading(false);
        })
        .catch(err => console.error(err));
    };
    
    fetchData();
    const interval = setInterval(fetchData, 8000); // Poll every 8s to match sim batch
    return () => clearInterval(interval);
  }, []);

  const activeProperties = statusRes?.properties || [];
  
  // Flatten sensors for easy lookup and counting
  const allSensors = activeProperties.flatMap(p => 
      p.sensors.map(s => ({ ...s, property: p }))
  );
  
  const selectedSensor = allSensors.find(s => s.sensor_id === selectedSensorId);

  const filteredProperties = activeProperties.map(p => {
    // Filter sensors inside the property
    const matchedSensors = p.sensors.filter(s => {
        const matchSearch = s.sensor_id.toLowerCase().includes(search.toLowerCase()) || 
                           s.type.toLowerCase().includes(search.toLowerCase()) ||
                           p.address.toLowerCase().includes(search.toLowerCase());
        
        if (filter === 'alert') return matchSearch && (s.risk_level === 'High' || s.risk_level === 'Medium');
        if (filter === 'offline') return false; // Mock offline status
        return matchSearch;
    });

    return { ...p, sensors: matchedSensors };
  }).filter(p => {
    // Show property if it has matched sensors, OR if it matches the search and we aren't strict filtering
    if (p.sensors.length > 0) return true;
    if (filter === 'alert' || filter === 'offline') return false;
    return p.address.toLowerCase().includes(search.toLowerCase());
  });

  const alertsCount = allSensors.filter(s => s.risk_level === 'High' || s.risk_level === 'Medium').length;

  const getSensorIcon = (type: string, risk_level: string) => {
      const colorClass = risk_level === 'High' ? "text-red-500 dark:text-red-400" : 
                         risk_level === 'Medium' ? "text-amber-500 dark:text-amber-400" : "text-emerald-500 dark:text-emerald-400";
      switch(type) {
          case 'environmental': return <Wind className={colorClass} />;
          case 'plumbing': return <Droplets className={colorClass} />;
          case 'boiler': return <Flame className={colorClass} />;
          case 'communal': return <Activity className={colorClass} />;
          default: return <Wifi className={colorClass} />;
      }
  };

  const getRiskColor = (risk: string) => {
      if (risk === 'High') return "border-red-200 dark:border-red-500/30 ring-red-100 bg-red-50/10 dark:bg-red-900/10";
      if (risk === 'Medium') return "border-amber-200 dark:border-amber-500/30 bg-amber-50/10 dark:bg-amber-900/10";
      return "border-slate-200 dark:border-slate-700/50";
  };

  return (
    <div className="relative h-full min-h-screen pb-10">
       
       {/* Filters Bar */}
       <div className="mb-6 space-y-4">
         <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Sensors</h1>
                <p className="text-slate-500 dark:text-slate-400">Real-time IoT device monitoring organized by property context.</p>
            </div>
            <div className="flex space-x-2">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-lg px-3 py-2 flex items-center space-x-2 shadow-sm">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{allSensors.length} Active Sensors</span>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-lg px-3 py-2 flex items-center space-x-2 shadow-sm">
                    <span className="flex h-2 w-2 relative">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{alertsCount} Alerts</span>
                </div>
            </div>
         </div>

         <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search property address, sensor ID..." 
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 placeholder-slate-400"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {(['all', 'alert', 'offline'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            "px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize",
                            filter === f 
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        )}
                    >
                        {f}
                    </button>
                ))}
            </div>
         </div>
       </div>

       {/* Grid */}
       {isLoading ? (
         <div className="text-center py-20 text-slate-400">Loading sensor network...</div>
       ) : (
         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProperties.map(prop => (
                <div 
                    key={prop.property_id}
                    className={cn(
                        "bg-white dark:bg-slate-800 rounded-xl border p-5 transition-all shadow-sm flex flex-col",
                        getRiskColor(prop.risk_level)
                    )}
                >
                    <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700/50 pb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600/50">
                                <Home className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{prop.address}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{prop.tenant_name} • {prop.sensors.length} Sensors</p>
                            </div>
                        </div>
                        {prop.risk_level === 'High' && (
                            <div className="px-2 py-1 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-md text-xs font-bold flex items-center shadow-sm border border-red-100 dark:border-red-500/20">
                                <AlertTriangle className="w-3 h-3 mr-1 animate-pulse" /> ALERT
                            </div>
                        )}
                        {prop.risk_level === 'Medium' && (
                            <div className="px-2 py-1 bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-md text-xs font-bold flex items-center shadow-sm border border-amber-100 dark:border-amber-500/20">
                                <AlertTriangle className="w-3 h-3 mr-1" /> WARNING
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 flex-1">
                        {prop.sensors.map((sensor: any) => (
                            <div 
                                key={sensor.sensor_id}
                                onClick={() => setSelectedSensorId(sensor.sensor_id)}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all group",
                                    sensor.risk_level === 'High' ? "bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800" :
                                    sensor.risk_level === 'Medium' ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800" :
                                    "bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-800"
                                )}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-1.5 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-100 dark:border-slate-700">
                                        {getSensorIcon(sensor.type, sensor.risk_level)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{sensor.type}</div>
                                        <div className="text-[10px] text-slate-400 font-mono">{sensor.sensor_id}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                        {sensor.type === 'environmental' && `${sensor.payload.temp?.toFixed(1)}°C, ${sensor.payload.humidity?.toFixed(0)}%`}
                                        {sensor.type === 'boiler' && `${sensor.payload.pressure?.toFixed(1)} bar`}
                                        {sensor.type === 'communal' && `${sensor.payload.status}`}
                                        {sensor.type === 'plumbing' && `${sensor.payload.pipe_temp?.toFixed(1)}°C`}
                                    </div>
                                    <div className="text-[9px] text-slate-400 mt-0.5">
                                        {new Date(sensor.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {prop.sensors.length === 0 && (
                            <div className="text-center py-4 text-sm text-slate-400">No sensors match criteria.</div>
                        )}
                    </div>
                </div>
            ))}
            
            {filteredProperties.length === 0 && (
                <div className="col-span-full text-center py-20 text-slate-500">
                    No properties or sensors matching criteria.
                </div>
            )}
         </div>
       )}

       {/* Sensor Detail Drawer */}
       <div className={cn(
           "fixed inset-y-0 right-0 w-[400px] bg-white dark:bg-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-slate-200 dark:border-slate-700/50 z-50 flex flex-col",
           selectedSensor ? "translate-x-0" : "translate-x-full"
       )}>
           {selectedSensor && (
               <>
                 <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-start bg-slate-50 dark:bg-slate-900/50">
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[10px] font-mono font-bold">{selectedSensor.sensor_id}</span>
                            <span className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></div> Online
                            </span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight capitalize">{selectedSensor.type} Sensor</h2>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center font-medium">
                            <Home className="w-3 h-3 mr-1"/> {selectedSensor.property.address}
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedSensorId(null)}
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {/* Primary Metric based on type */}
                    <div className="text-center py-6 relative">
                        <div className="w-40 h-40 mx-auto rounded-full border-8 border-slate-100 dark:border-slate-700/50 flex items-center justify-center relative bg-white dark:bg-slate-800 shadow-sm">
                             <div className="text-center">
                                 <div className="text-4xl font-bold text-slate-900 dark:text-white">
                                    {selectedSensor.type === 'environmental' && `${selectedSensor.payload.humidity?.toFixed(0)}%`}
                                    {selectedSensor.type === 'boiler' && selectedSensor.payload.pressure?.toFixed(1)}
                                    {selectedSensor.type === 'communal' && selectedSensor.payload.status}
                                    {selectedSensor.type === 'plumbing' && `${selectedSensor.payload.pipe_temp?.toFixed(1)}°`}
                                 </div>
                                 <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">
                                    {selectedSensor.type === 'environmental' && "Humidity"}
                                    {selectedSensor.type === 'boiler' && "Pressure (Bar)"}
                                    {selectedSensor.type === 'communal' && "Status"}
                                    {selectedSensor.type === 'plumbing' && "Pipe Temp"}
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Additional Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {selectedSensor.type === 'environmental' && (
                            <>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 text-center">
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Temperature</div>
                                    <div className="font-bold text-slate-700 dark:text-slate-200 text-xl">{selectedSensor.payload.temp?.toFixed(1)}°C</div>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 text-center">
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">CO2 Level</div>
                                    <div className="font-bold text-slate-700 dark:text-slate-200 text-xl">{selectedSensor.payload.co2} ppm</div>
                                </div>
                            </>
                        )}
                        {selectedSensor.type === 'boiler' && (
                            <>
                                <div className="col-span-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 text-center flex items-center justify-between">
                                    <div className="flex items-center text-slate-500"><AlertTriangle className="w-4 h-4 mr-2"/> Error Code</div>
                                    <div className="font-bold text-slate-700 dark:text-slate-200 text-lg">{selectedSensor.payload.error_code || 'None'}</div>
                                </div>
                            </>
                        )}
                        {selectedSensor.type === 'plumbing' && (
                            <>
                                <div className="col-span-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 text-center flex items-center justify-between">
                                    <div className="flex items-center text-slate-500"><Droplets className="w-4 h-4 mr-2"/> Leak Detected</div>
                                    <div className={cn("font-bold text-lg", selectedSensor.payload.leak_detected ? "text-red-500" : "text-emerald-500")}>{selectedSensor.payload.leak_detected ? 'YES' : 'NO'}</div>
                                </div>
                            </>
                        )}
                        {selectedSensor.type === 'communal' && (
                            <>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 text-center">
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Vibration</div>
                                    <div className="font-bold text-slate-700 dark:text-slate-200 text-xl">{selectedSensor.payload.vibration_hz?.toFixed(1)} Hz</div>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 text-center">
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Battery</div>
                                    <div className="font-bold text-slate-700 dark:text-slate-200 text-xl flex items-center justify-center"><Battery className="w-4 h-4 mr-1 text-slate-400" /> {selectedSensor.payload.battery_health}%</div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Removed Chart */}

                    {/* Device Details (Raw Payload) */}
                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Raw Data Payload</h4>
                        <pre className="bg-slate-900 text-emerald-400 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                            {JSON.stringify(selectedSensor.payload, null, 2)}
                        </pre>
                    </div>
                 </div>
               </>
           )}
       </div>

    </div>
  );
}
