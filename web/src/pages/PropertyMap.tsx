import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { 
  X, 
  MapPin, 
  Ticket, 
  Mail, 
  ArrowUpRight 
} from 'lucide-react';
import { cn } from '../lib/utils';

// --- Assets & Icons ---
// Fix Leaflet's default icon issue in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom Markers (Colored)
// Note: In a real app we'd use custom SVG icons for better styling
const createCustomIcon = (color: string) => new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const redIcon = createCustomIcon('red');
const orangeIcon = createCustomIcon('orange');
const greenIcon = createCustomIcon('green');

function getIconForRisk(risk: string) {
    if (risk === 'High') return redIcon;
    if (risk === 'Medium') return orangeIcon;
    return greenIcon;
}

// Map Controller to fit bounds if needed
function MapController({ center }: { center: [number, number] }) {
    const map = useMap();
    map.flyTo(center, 13);
    return null;
}

export default function PropertyMap({ properties }: { properties: any[] }) {
    const [selectedProperty, setSelectedProperty] = useState<any | null>(null);

    // Filter valid properties with coords
    const validProps = properties.filter(p => p.lat && p.long);
    // Center on London (or first prop)
    const center: [number, number] = validProps.length > 0 
        ? [validProps[0].lat, validProps[0].long] 
        : [51.505, -0.09];

  return (
    <div className="h-[calc(100vh-8rem)] relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none bg-slate-50 dark:bg-slate-900">
      
      {/* Map Layer */}
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        className="z-0 [&_.leaflet-tile-pane]:dark:filter [&_.leaflet-tile-pane]:dark:invert-[.95] [&_.leaflet-tile-pane]:dark:hue-rotate-180 [&_.leaflet-tile-pane]:dark:contrast-[0.9]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {validProps.map(prop => (
            <Marker 
                key={prop.id} 
                position={[prop.lat, prop.long]}
                icon={getIconForRisk(prop.risk_level)}
                eventHandlers={{
                    click: () => setSelectedProperty(prop),
                }}
            >
                <Popup className="[&_.leaflet-popup-content-wrapper]:dark:bg-slate-800 [&_.leaflet-popup-tip]:dark:bg-slate-800">
                    <div className="font-sans">
                        <strong className="block text-slate-900 dark:text-white">{prop.address}</strong>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{prop.tenant_name}</div>
                        <span className={cn(
                            "text-xs font-bold px-1.5 py-0.5 rounded",
                            prop.risk_level === 'High' ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400" :
                            prop.risk_level === 'Medium' ? "bg-amber-100 dark:bg-orange-500/20 text-amber-700 dark:text-orange-400" :
                            "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                        )}>{prop.risk_level} Risk</span>
                    </div>
                </Popup>
            </Marker>
        ))}
        {selectedProperty && <MapController center={[selectedProperty.lat, selectedProperty.long]} />}
      </MapContainer>

      {/* Side Drawer (Overlay) */}
      <div className={cn(
          "absolute top-0 right-0 bottom-0 w-96 bg-white dark:bg-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-slate-200 dark:border-slate-700/50 z-[1000] flex flex-col",
          selectedProperty ? "translate-x-0" : "translate-x-full"
      )}>
          {selectedProperty && (
            <>
                <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-start bg-slate-50 dark:bg-slate-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{selectedProperty.address}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" /> Social Housing Portfolio
                        </p>
                    </div>
                    <button 
                        onClick={() => setSelectedProperty(null)}
                        className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {/* Status Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Status</span>
                            <span className={cn(
                                "px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset",
                                selectedProperty.risk_level === 'High' ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 ring-red-600/20" :
                                selectedProperty.risk_level === 'Medium' ? "bg-amber-50 dark:bg-orange-500/10 text-amber-700 dark:text-orange-400 ring-amber-600/20" :
                                "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-600/20"
                            )}>
                                {selectedProperty.risk_level} Risk
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg text-center">
                                <span className="block text-2xl font-bold text-slate-900 dark:text-white">{selectedProperty.temp?.toFixed(1)}°C</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">Temperature</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg text-center">
                                <span className="block text-2xl font-bold text-slate-900 dark:text-white">{selectedProperty.humidity?.toFixed(0)}%</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">Humidity</span>
                            </div>
                        </div>
                        <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-3">
                            Last updated: {new Date(selectedProperty.last_updated).toLocaleString()}
                        </p>
                    </div>

                    {/* Tenant Info */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Tenant Information</h3>
                        <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                             <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold mr-3">
                                {selectedProperty.tenant_name.charAt(0)}
                             </div>
                             <div>
                                 <p className="font-medium text-slate-900 dark:text-white">{selectedProperty.tenant_name}</p>
                                 <p className="text-xs text-slate-500 dark:text-slate-400">Occupant since 2023</p>
                             </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors">
                                <Ticket className="w-4 h-4 mr-2" />
                                Create Ticket
                            </button>
                            <button className="flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <Mail className="w-4 h-4 mr-2" />
                                Message
                            </button>
                        </div>
                    </div>

                    {/* Active Tickets Mini List */}
                    <div>
                         <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Active Tickets</h3>
                            <button className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center">
                                View History <ArrowUpRight className="w-3 h-3 ml-1" />
                            </button>
                         </div>
                         <div className="space-y-2">
                            <div className="p-3 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-lg text-sm shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer">
                                <div className="flex justify-between">
                                    <span className="font-medium text-slate-800 dark:text-slate-200">Boiler Noises</span>
                                    <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded">Open</span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Reported 2 days ago</p>
                            </div>
                         </div>
                    </div>

                </div>
            </>
          )}
      </div>

    </div>
  );
}
