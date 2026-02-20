import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

// Components
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Tenants from './pages/Tenants'

// API
import { fetchProperties, fetchTickets } from './api'
import type { Property, Ticket } from './api'
import PropertyMap from './pages/PropertyMap'
import LiveSensors from './pages/LiveSensors'
import PropertyDetails from './pages/PropertyDetails'
import Tickets from './pages/Tickets'
import Analytics from './pages/Analytics'
import About from './pages/About'

interface PropertyWithSensor extends Property {
    temp?: number;
    humidity?: number;
}

function App() {
  const [sensorData, setSensorData] = useState<any>(null)
  const [properties, setProperties] = useState<PropertyWithSensor[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])

  // Global Data Fetching (Polling)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:8000/status')
        const data = await res.json()
        setSensorData(data)
      } catch (err) {
        console.error("Failed to fetch status", err)
      }
    }

    const loadProps = async () => {
        try {
            const props = await fetchProperties();
            setProperties(props);
            
            const ticks = await fetchTickets();
            setTickets(ticks);
        } catch (err) {
            console.error("Failed to load data", err);
        }
    }

    fetchData()
    loadProps()
    const interval = setInterval(() => {
        fetchData();
        loadProps();
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Merge real sensor data into Property list
  const displayProperties: PropertyWithSensor[] = properties.map(p => {
    // If this is the Simulated Property (ID 1 or Sensor 01), override with live data
    if (p.id === 1 || p.address.includes("Sensor 01")) {
         return {
             ...p,
             risk_level: sensorData?.risk_level || p.risk_level,
             temp: sensorData?.latest_reading?.temp || 0,
             humidity: sensorData?.latest_reading?.humidity || 0,
             last_updated: sensorData?.latest_reading?.timestamp || p.last_updated
         }
    }
    // For others, generate fake temp/humidity based on risk if missing (as per original logic)
    // Add random fluctuation to make it look "live"
    const baseTemp = p.risk_level === 'High' ? 16 : 21;
    const baseHum = p.risk_level === 'High' ? 85 : 45;
    
    // Simple pseudo-random fluctuation based on time + id
    const time = Date.now();
    const noise = Math.sin(time / 2000 + p.id) * 0.5; // Fluctuate +/- 0.5 degrees
    
    return {
        ...p,
        temp: Math.round((baseTemp + noise) * 10) / 10,
        humidity: Math.round((baseHum + noise * 2) * 10) / 10
    }
  })

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard properties={displayProperties} tickets={tickets} />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tenants" element={<Tenants />} />
          
          <Route path="properties/:id" element={<PropertyDetails />} />
          {/* Placeholders for future phases */}
          <Route path="map" element={<PropertyMap properties={displayProperties} />} />
          <Route path="sensors" element={<LiveSensors />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="about" element={<About />} />
          <Route path="settings" element={<div className="p-10 text-center text-slate-500">Settings Coming Soon</div>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
