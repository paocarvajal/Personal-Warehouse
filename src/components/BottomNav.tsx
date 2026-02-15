import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Folder, Box, ScanLine, TrendingUp, PlusSquare } from 'lucide-react';


const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Inicio', path: '/' },
        { icon: Folder, label: 'Cosas', path: '/explorer' },
        { icon: Box, label: 'Cajas', path: '/boxes' },
        { icon: TrendingUp, label: 'Bench', path: '/benchmarking' },
        { icon: PlusSquare, label: 'Add', path: '/add' },
        { icon: ScanLine, label: 'Scan', path: '/scan' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 flex justify-around items-center px-2 py-3 lg:hidden rounded-t-2xl backdrop-blur-xl bg-slate-900/80">
            {navItems.map((item) => (
                <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`nav-item flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200 ${location.pathname === item.path ? 'text-[var(--accent-purple)] scale-110' : 'text-slate-500 hover:text-slate-300'
                        }`}
                >
                    <item.icon size={24} className={`mb-0.5 ${location.pathname === item.path ? 'fill-[var(--accent-purple)]/20' : ''}`} />
                    <span className="text-[10px] font-medium">
                        {item.label}
                    </span>
                    {location.pathname === item.path && (
                        <span className="absolute -bottom-2 w-1 h-1 bg-[var(--accent-purple)] rounded-full shadow-[0_0_8px_var(--accent-purple)]"></span>
                    )}
                </button>
            ))}
        </nav>
    );
};

export default BottomNav;
