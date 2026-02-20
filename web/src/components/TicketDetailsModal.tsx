import { useState, useEffect } from 'react';
import { X, Save, Trash2, Edit2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { updateTicket, deleteTicket } from '../api';
import type { Ticket } from '../api';

interface TicketDetailsModalProps {
    ticket: Ticket | null;
    isOpen: boolean;
    onClose: () => void;
    onTicketUpdated: (updatedTicket?: Ticket) => void;
}

export default function TicketDetailsModal({ ticket, isOpen, onClose, onTicketUpdated }: TicketDetailsModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [status, setStatus] = useState('Open');
    const [category, setCategory] = useState('Maintenance');

    useEffect(() => {
        if (ticket) {
            setTitle(ticket.title);
            setDescription(ticket.description);
            setPriority(ticket.priority);
            setStatus(ticket.status);
            setCategory(ticket.category);
            setIsEditing(false); // Reset to view mode on new ticket open
            setShowDeleteConfirm(false); // Reset delete state
        }
    }, [ticket, isOpen]);

    const handleSave = async () => {
        if (!ticket) return;
        console.log("Saving ticket updates for ID:", ticket.id, {title, description, priority, status, category});
        setLoading(true);
        try {
            const updatedTicket = await updateTicket(ticket.id, {
                title,
                description,
                priority,
                status,
                category
            });
            onTicketUpdated(updatedTicket);
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update ticket", err);
            alert("Failed to update ticket");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!ticket) return;
        console.log("Attempting to delete ticket ID:", ticket.id);
        
        setLoading(true);
        try {
            await deleteTicket(ticket.id);
            onTicketUpdated(undefined); // Indicates deletion
        } catch (err) {
            console.error("Failed to delete ticket", err);
            alert("Failed to delete ticket");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        setStatus(newStatus);
        console.log("Status changed to:", newStatus, "for ticket ID:", ticket?.id);
        // If not in full edit mode, save status immediately for better UX
        if (!isEditing && ticket) {
             setLoading(true);
             console.log("Auto-saving status change...");
             try {
                 const updatedTicket = await updateTicket(ticket.id, { status: newStatus });
                 onTicketUpdated(updatedTicket);
             } catch (err) {
                 console.error("Failed to update status", err);
                 // Revert on failure
                 setStatus(ticket.status);
             } finally {
                 setLoading(false);
             }
        }
    };

    if (!isOpen || !ticket) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div 
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 transform transition-all scale-100 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-slate-100 dark:border-slate-700/50">
                    <div>
                        <div className="flex items-center space-x-3 mb-1">
                            <span className="text-sm font-mono text-slate-400">#{ticket.id}</span>
                            {!isEditing && (
                                <span className={cn(
                                    "px-2 py-0.5 rounded textxs font-bold uppercase",
                                    priority === 'Emergency' ? "bg-red-100 text-red-700" :
                                    priority === 'High' ? "bg-orange-100 text-orange-700" :
                                    "bg-blue-100 text-blue-700"
                                )}>
                                    {priority}
                                </span>
                            )}
                        </div>
                        {isEditing ? (
                            <input 
                                type="text"
                                className="text-xl font-bold text-slate-900 dark:text-white bg-transparent border-b border-slate-300 dark:border-slate-600 focus:border-blue-500 outline-none w-full"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        ) : (
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{ticket.title}</h2>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6">
                    
                    {/* Status & Priority Controls (Always Visible) */}
                    <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                            <select 
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                            >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Awaiting Tenant">Awaiting Tenant</option>
                                <option value="Resolved">Resolved</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Priority</label>
                            <select 
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                                value={priority}
                                disabled={!isEditing}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Emergency">Emergency</option>
                            </select>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block text-slate-500">Tenant</span>
                            <span className="font-medium text-slate-900 dark:text-white">{ticket.tenant_name}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500">Property</span>
                            <span className="font-medium text-slate-900 dark:text-white">{ticket.property_address}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500">Reported</span>
                            <span className="font-medium text-slate-900 dark:text-white flex items-center">
                                <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                {new Date(ticket.created_at).toLocaleString()}
                            </span>
                        </div>
                        <div>
                            <span className="block text-slate-500">Category</span>
                            {isEditing ? (
                                <select 
                                    className="bg-transparent border-b border-slate-300 dark:border-slate-600 focus:border-blue-500 outline-none font-medium text-slate-900 dark:text-white"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Plumbing">Plumbing</option>
                                    <option value="Electrical">Electrical</option>
                                    <option value="Access">Access</option>
                                    <option value="Other">Other</option>
                                </select>
                            ) : (
                                <span className="font-medium text-slate-900 dark:text-white">{ticket.category}</span>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Description</label>
                        {isEditing ? (
                            <textarea 
                                className="w-full h-32 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        ) : (
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                {ticket.description}
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30 rounded-b-2xl">
                    {showDeleteConfirm ? (
                        <div className="w-full flex items-center justify-between animate-in slide-in-from-right-2 duration-200">
                            <span className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center">
                                <Trash2 className="w-4 h-4 mr-2" /> Are you sure?
                            </span>
                            <div className="flex space-x-3">
                                <button 
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-all text-sm font-medium flex items-center"
                                >
                                    {loading ? 'Deleting...' : 'Confirm Delete'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <button 
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Ticket
                            </button>

                            <div className="flex space-x-3">
                                {isEditing ? (
                                    <>
                                        <button 
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all text-sm font-medium flex items-center"
                                        >
                                            {loading ? 'Saving...' : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" /> Save Changes
                                                </>
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 text-slate-700 dark:text-slate-200 rounded-lg shadow-sm transition-all text-sm font-medium flex items-center"
                                    >
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Edit Details
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}
