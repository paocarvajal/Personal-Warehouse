import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Box,
    Heart,
    BarChart2,
    ScanLine,
    TrendingUp,
    Bell,
    Package,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
    const { items, boxes } = useInventory();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Data Calculations
    const totalItems = items.length;
    const totalBoxes = boxes.length;

    // Calculate total estimated value
    const totalValue = useMemo(() => {
        return items.reduce((acc, item) => {
            // Price might be missing or a string, handle safely
            // Assuming price is stored as string or number
            const value = parseFloat(String(item.estimatedValue || 0)) || 0;
            const quantity = parseInt(String(item.quantity || 1)) || 1;
            return acc + (value * quantity);
        }, 0);
    }, [items]);

    const recentItems = [...items].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5);

    // User Name Logic
    const [userName, setUserName] = useState(localStorage.getItem('warehouse_user_name') || user?.displayName?.split(' ')[0] || 'Paola');

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setUserName(newName);
        localStorage.setItem('warehouse_user_name', newName);
    };

    return (
        <div className="animate-in fade-in duration-500 pb-24">

            {/* HEADER */}
            <header className="pt-4 pb-4 px-1 glass-panel border-b-0 border-white/5 rounded-2xl mb-6">
                <div className="flex justify-between items-center px-4">
                    <div className="flex items-center gap-4">
                        <div className="relative group cursor-pointer">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent-purple)] to-purple-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-200"></div>
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt="Profile"
                                    className="relative w-12 h-12 rounded-full object-cover border-2 border-slate-900"
                                />
                            ) : (
                                <div className="relative w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-900 text-xl font-bold text-[var(--accent-purple)]">
                                    {userName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-sm text-slate-400 font-medium">Bienvenida,</h1>
                            <input
                                value={userName}
                                onChange={handleNameChange}
                                className="text-xl font-bold text-white tracking-tight bg-transparent border-none p-0 w-full focus:ring-0 focus:bg-transparent hover:text-[var(--accent-purple)] transition-colors"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {/* Notification Bell (Visual only for now) */}
                        <button className="relative p-2.5 rounded-full bg-slate-800/50 hover:bg-slate-700/50 text-white transition-colors border border-white/10">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-[var(--accent-purple)] rounded-full border border-slate-900 shadow-[0_0_8px_rgba(185,13,242,0.8)]"></span>
                        </button>
                        {/* Logout Button */}
                        <button
                            onClick={() => logout()}
                            className="p-2.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors border border-red-500/20"
                            title="Cerrar Sesión"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* HERO SECTION */}
            <section className="relative mb-8">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-[var(--accent-purple)]/20 blur-[60px] rounded-full transform -translate-y-4 scale-75 pointer-events-none"></div>

                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                    {/* Abstract Background Chart (SVG) */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 opacity-20 pointer-events-none">
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 150">
                            <path d="M0,100 C150,150 200,50 350,80 C450,100 500,20 500,20 L500,150 L0,150 Z" fill="url(#grad1)"></path>
                            <defs>
                                <linearGradient id="grad1" x1="0%" x2="100%" y1="0%" y2="0%">
                                    <stop offset="0%" stopColor="var(--accent-purple)" stopOpacity="1" />
                                    <stop offset="100%" stopColor="var(--accent-teal)" stopOpacity="1" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div>
                            <p className="text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">Valor Estimado</p>
                            <h2 className="text-4xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
                                ${totalValue.toLocaleString()}
                                <span className="text-xs font-bold text-accent-teal bg-[var(--accent-teal-light)] px-2 py-0.5 rounded-full border border-[var(--accent-teal-light)] flex items-center gap-0.5 ml-2">
                                    <TrendingUp size={12} /> +12%
                                </span>
                            </h2>
                        </div>
                    </div>

                    <div className="flex justify-between gap-4 relative z-10 w-full px-2">
                        <div className="text-center">
                            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-1">Items</p>
                            <p className="text-xl font-bold text-white">{totalItems}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-1">Cajas</p>
                            <p className="text-xl font-bold text-white">{totalBoxes}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-1">Prestados</p>
                            <p className="text-xl font-bold text-white">0</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* QUICK ACTIONS */}
            <section className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Accesos Rápidos</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Add Item */}
                    <button
                        onClick={() => navigate('/add')}
                        className="glass-panel glass-card-hover p-4 rounded-xl flex flex-col items-center justify-center gap-3 h-32 group transition-all duration-300"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center group-hover:bg-[var(--accent-purple-light)] transition-colors border border-white/5 group-hover:border-[var(--accent-purple)]/50">
                            <Plus size={24} className="text-[var(--accent-purple)]" />
                        </div>
                        <span className="text-sm font-medium text-slate-300">Nuevo Item</span>
                    </button>

                    {/* My Boxes */}
                    <button
                        onClick={() => navigate('/boxes')}
                        className="glass-panel glass-card-hover p-4 rounded-xl flex flex-col items-center justify-center gap-3 h-32 group transition-all duration-300"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors border border-white/5 group-hover:border-blue-500/50">
                            <Box size={24} className="text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-300">Mis Cajas</span>
                    </button>

                    {/* Wishlist / Benchmarking */}
                    <button
                        onClick={() => navigate('/benchmarking')}
                        className="glass-panel glass-card-hover p-4 rounded-xl flex flex-col items-center justify-center gap-3 h-32 group transition-all duration-300"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors border border-white/5 group-hover:border-pink-500/50">
                            <Heart size={24} className="text-pink-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-300">Wishlist</span>
                    </button>

                    {/* Analytics / Inventory List */}
                    <button
                        onClick={() => navigate('/explorer')}
                        className="glass-panel glass-card-hover p-4 rounded-xl flex flex-col items-center justify-center gap-3 h-32 group transition-all duration-300"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors border border-white/5 group-hover:border-amber-500/50">
                            <BarChart2 size={24} className="text-amber-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-300">Explorar</span>
                    </button>
                </div>

                {/* Central SCAN QR Action */}
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={() => navigate('/scan')}
                        className="relative group w-full"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent-purple)] to-purple-600 rounded-xl blur opacity-70 group-hover:opacity-100 transition duration-200 animate-pulse"></div>
                        <div className="relative flex items-center justify-center gap-3 bg-slate-900 border border-white/10 p-5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer z-10">
                            <ScanLine size={28} className="text-[var(--accent-purple)]" />
                            <span className="text-lg font-bold text-white tracking-wide">SCAN QR CODE</span>
                        </div>
                    </button>
                </div>
            </section>

            {/* RECENT ACTIVITY - HIDDEN per user request for cleaner look */}
            {/* 
            <section>
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-lg font-bold text-white">Actividad Reciente</h3>
                    <button onClick={() => navigate('/inventory')} className="text-[var(--accent-purple)] text-xs font-semibold hover:text-purple-400 transition-colors">Ver Todo</button>
                </div>
                ... (hidden)
            </section> 
            */}
        </div>
    );
};

export default Home;
