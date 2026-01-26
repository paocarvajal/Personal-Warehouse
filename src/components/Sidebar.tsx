import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, PlusSquare, Box, ScanLine, TrendingUp, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    path: string;
    isActive: boolean;
    isCollapsed: boolean;
    onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    icon: Icon,
    label,
    path,
    isActive,
    isCollapsed,
    onClick
}) => {
    return (
        <button
            onClick={onClick}
            className={`sidebar-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center px-2' : 'justify-start'
                }`}
            title={isCollapsed ? label : undefined}
        >
            <Icon size={22} className={isActive ? 'text-[var(--accent-purple)]' : 'text-gray-400'} />
            {!isCollapsed && <span className="font-medium text-sm">{label}</span>}
        </button>
    );
};

const Sidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const menuItems = [
        { icon: Home, label: 'Inicio', path: '/' },
        { icon: TrendingUp, label: 'Benchmarking', path: '/benchmarking' },
        { icon: Package, label: 'Inventario', path: '/inventory' },
        { icon: Box, label: 'Cajas', path: '/boxes' },
        { icon: PlusSquare, label: 'Agregar', path: '/add' },
        { icon: ScanLine, label: 'Escanear', path: '/scan' },
    ];

    return (
        <aside
            className={`fixed left-0 top-0 bottom-0 z-40 bg-[var(--bg-secondary)] border-r border-white/5 transition-all duration-300 ease-in-out hidden lg:flex flex-col ${isCollapsed ? 'w-20' : 'w-72'
                }`}
        >
            {/* HEADER */}
            <div className={`p-6 border-b border-white/5 flex items-center ${isCollapsed ? 'justify-center' : 'justify-start gap-3'}`}>
                <div className="bg-purple-500/10 p-2 rounded-xl flex-shrink-0">
                    <Package className="text-[var(--accent-purple)]" size={24} />
                </div>
                {!isCollapsed && (
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight">Warehouse</h1>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Gestión Personal</p>
                    </div>
                )}
            </div>

            {/* MENU */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <SidebarItem
                        key={item.path}
                        icon={item.icon}
                        label={item.label}
                        path={item.path}
                        isActive={location.pathname === item.path}
                        isCollapsed={isCollapsed}
                        onClick={() => navigate(item.path)}
                    />
                ))}
            </nav>

            {/* USER PROFILE */}
            <div className="p-4 border-t border-white/5">
                {user && (
                    <div className={`flex items-center gap-3 p-2 rounded-xl bg-black/20 mb-3 ${isCollapsed ? 'justify-center' : ''}`}>
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-purple-500/30" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                                {user.displayName?.charAt(0) || 'U'}
                            </div>
                        )}

                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{user.displayName?.split(' ')[0]}</p>
                                <button
                                    onClick={logout}
                                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mt-0.5"
                                >
                                    <LogOut size={12} /> Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full sidebar-item justify-center hover:bg-[var(--bg-tertiary)]"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
