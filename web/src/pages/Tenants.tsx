import { useState, useEffect } from 'react';
import { fetchUsers, deleteUser } from '../api';
import type { User } from '../api';
import { Search, Mail, Phone, User as UserIcon, Building, ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Tenants() {
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const load = async () => {
             try {
                const data = await fetchUsers();
                setUsers(data);
            } catch (err) {
                console.error("Failed to load users", err);
            }
        };
        load();
    }, []);

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to remove this tenant?')) {
            try {
                await deleteUser(id);
                setUsers(users.filter(u => u.id !== id));
            } catch (err) {
                console.error("Failed to delete user", err);
            }
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-6xl mx-auto text-slate-900 dark:text-slate-200">
             {/* Header */}
             <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tenant Directory</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage tenant profiles and contact details</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                 <div className="relative w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search tenants..."
                        className="pl-10 block w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm md:text-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 dark:text-white dark:placeholder-slate-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    Showing <span className="font-medium text-slate-900 dark:text-white">{filteredUsers.length}</span> tenants
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none hover:shadow-md dark:hover:border-slate-600 transition-all overflow-hidden group">
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-4">
                                     <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-lg">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.name}</h3>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-transparent dark:border-emerald-500/20">
                                            Active Tenant
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handleDelete(user.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-full transition-colors"
                                    title="Remove Tenant"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                    <Mail className="w-4 h-4 mr-3 text-slate-400 dark:text-slate-500" />
                                    {user.email}
                                </div>
                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                    <Phone className="w-4 h-4 mr-3 text-slate-400 dark:text-slate-500" />
                                    {user.phone}
                                </div>
                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                    <Building className="w-4 h-4 mr-3 text-slate-400 dark:text-slate-500" />
                                    <span className="italic text-slate-400 dark:text-slate-500">Property linked via backend</span>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                            <span className="text-xs text-slate-500 dark:text-slate-400">ID: {user.id}</span>
                            <Link to={`/tenants/${user.id}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center">
                                View Profile <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            
            {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                    <UserIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                    <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">No tenants found</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try adjusting your search terms.</p>
                </div>
            )}
        </div>
    );
}
