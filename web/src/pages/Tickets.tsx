import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  User,
  ArrowUpRight,
  Plus,
  Calendar
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchTickets } from '../api';
import type { Ticket } from '../api';
import CreateTicketModal from '../components/CreateTicketModal';
import TicketDetailsModal from '../components/TicketDetailsModal';

// --- Constants ---
const PRIORITY_STYLES = {
  Emergency: "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20",
  High: "bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20",
  Medium: "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
  Low: "bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-600",
};

const STATUS_STYLES = {
  Open: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 ring-red-600/20 dark:ring-red-500/20",
  "In Progress": "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-blue-600/20 dark:ring-blue-500/20",
  Resolved: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 ring-green-600/20 dark:ring-green-500/20",
  "Awaiting Tenant": "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-600/20 dark:ring-amber-500/20",
};

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('All Time');
  const [specificDate, setSpecificDate] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  async function load() {
      try {
        setLoading(true);
        const data = await fetchTickets();
        setTickets(data);
      } catch (err) {
        console.error("Failed to load tickets", err);
      } finally {
        setLoading(false);
      }
  }

  useEffect(() => {
    load();
  }, []);

  // --- Filtering ---
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchSearch = 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tenant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.property_address?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter;

      let matchDate = true;
      if (dateFilter === 'Today') {
          if (t.created_at) {
              const ticketDate = new Date(t.created_at).setHours(0,0,0,0);
              const today = new Date().setHours(0,0,0,0);
              matchDate = ticketDate === today;
          } else {
              matchDate = false;
          }
      } else if (dateFilter === 'Custom' && specificDate) {
          if (t.created_at) {
              const ticketDate = new Date(t.created_at).toISOString().split('T')[0];
              matchDate = ticketDate === specificDate;
          } else {
              matchDate = false;
          }
      }

      return matchSearch && matchStatus && matchPriority && matchDate;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter, dateFilter, specificDate]);

  if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading tickets...</div>;

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-200">
      <CreateTicketModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onTicketCreated={load} 
      />
      
      <TicketDetailsModal
        ticket={selectedTicket}
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onTicketUpdated={(updatedTicket?: Ticket) => {
            load();
            if (updatedTicket) {
                // Keep modal open and refresh data
                setSelectedTicket(updatedTicket);
            } else {
                // Close modal on deletion
                setSelectedTicket(null);
            }
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tickets & Issues</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage tenant reports and maintenance</p>
        </div>
        <div className="flex space-x-3">
            <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors shadow-sm flex items-center"
            >
                <Plus className="w-4 h-4 mr-2" />
                Create Ticket
            </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700/50">
        <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
                type="text" 
                placeholder="Search ticket, tenant, or property..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

        <div className="flex items-center space-x-3 border-l border-slate-200 dark:border-slate-700 pl-4">
            <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <select 
                    className="text-sm bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-300 font-medium cursor-pointer outline-none"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                >
                    <option value="All Time" className="dark:bg-slate-800">All Time</option>
                    <option value="Today" className="dark:bg-slate-800">Today</option>
                    <option value="Custom" className="dark:bg-slate-800">Select Date...</option>
                </select>
                {dateFilter === 'Custom' && (
                    <input 
                        type="date"
                        className="text-sm border border-slate-200 dark:border-slate-700 rounded bg-transparent px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={specificDate}
                        onChange={(e) => setSpecificDate(e.target.value)}
                    />
                )}
            </div>
            
            <div className="flex items-center space-x-2 border-l border-slate-200 dark:border-slate-700 pl-4">
                <Filter className="w-4 h-4 text-slate-400" />
                <select 
                    className="text-sm bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-300 font-medium cursor-pointer outline-none"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All" className="dark:bg-slate-800">All Status</option>
                    <option value="Open" className="dark:bg-slate-800">Open</option>
                    <option value="In Progress" className="dark:bg-slate-800">In Progress</option>
                    <option value="Resolved" className="dark:bg-slate-800">Resolved</option>
                </select>
            </div>
             <div className="flex items-center space-x-2">
                <select 
                    className="text-sm bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-300 font-medium cursor-pointer outline-none"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                >
                    <option value="All" className="dark:bg-slate-800">All Priority</option>
                    <option value="Emergency" className="dark:bg-slate-800">Emergency</option>
                    <option value="High" className="dark:bg-slate-800">High</option>
                    <option value="Medium" className="dark:bg-slate-800">Medium</option>
                    <option value="Low" className="dark:bg-slate-800">Low</option>
                </select>
            </div>
        </div>
      </div>

      {/* Ticket List Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700/50 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
            <thead className="bg-slate-50/50 dark:bg-slate-900/30">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Issue Summary</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tenant</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SLA Due</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                {filteredTickets.map((ticket) => (
                    <tr 
                        key={ticket.id} 
                        onClick={() => setSelectedTicket(ticket)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group"
                    >
                        {/* Issue Summary */}
                        <td className="px-6 py-4">
                            <div className="flex items-start">
                                <span className="mr-3 mt-1 p-1.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                    {/* Icon based on category - simplified for now */}
                                    <AlertCircle className="w-4 h-4" />
                                </span>
                                <div>
                                    <div className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        #{ticket.id} - {ticket.title}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs truncate">
                                        {ticket.description}
                                    </div>
                                </div>
                            </div>
                        </td>

                        {/* Tenant */}
                        <td className="px-6 py-4">
                            <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 mr-3">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="text-sm font-medium text-slate-900 dark:text-slate-200">
                                    {ticket.tenant_name || "Unknown"}
                                </div>
                            </div>
                        </td>

                        {/* Property */}
                        <td className="px-6 py-4">
                            <div className="flex items-center">
                                <div className={cn(
                                    "w-2.5 h-2.5 rounded-full mr-2",
                                    ticket.property_risk_level === 'High' ? "bg-red-500" :
                                    ticket.property_risk_level === 'Medium' ? "bg-amber-500" : "bg-emerald-500"
                                )}></div>
                                <div>
                                    <div className="text-sm text-slate-900 dark:text-slate-200">{ticket.property_address?.split(',')[0]}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">View History <ArrowUpRight className="w-3 h-3 inline" /></div>
                                </div>
                            </div>
                        </td>

                        {/* Priority */}
                        <td className="px-6 py-4">
                            <span className={cn(
                                "px-2.5 py-0.5 rounded-full text-xs font-bold border",
                                PRIORITY_STYLES[ticket.priority as keyof typeof PRIORITY_STYLES] || PRIORITY_STYLES.Medium
                            )}>
                                {ticket.priority}
                            </span>
                        </td>

                         {/* Status */}
                        <td className="px-6 py-4">
                            <span className={cn(
                                "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ring-1 ring-inset",
                                STATUS_STYLES[ticket.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.Open
                            )}>
                                {ticket.status}
                            </span>
                        </td>

                        {/* SLA Due */}
                        <td className="px-6 py-4 text-right">
                             {ticket.sla_due ? (
                                <div className="flex items-center justify-end text-sm text-amber-600 dark:text-amber-400 font-medium">
                                    <Clock className="w-4 h-4 mr-1.5" />
                                    {new Date(ticket.sla_due).toLocaleDateString()}
                                </div>
                             ) : (
                                 <span className="text-xs text-slate-400 dark:text-slate-600">No SLA</span>
                             )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        {filteredTickets.length === 0 && (
            <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">No tickets found</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your filters or search query.</p>
            </div>
        )}
      </div>
    </div>
  );
}
