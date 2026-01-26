import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, Box, ScanLine } from 'lucide-react';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    path: string;
    isActive: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
    icon: Icon,
    label,
    isActive,
    onClick
}) => {
    return (
        <button
            onClick={onClick}
            className={`nav-item flex-1 max-w-[100px] py-2 px-2 text-center flex flex-col items-center justify-center ${isActive ? 'active' : ''
                }`}
        >
            <Icon size={24} className={`mb-1 ${isActive ? 'text-[var(--accent-purple)]' : 'text-gray-400'}`} />
            <span className={`text-[10px] font-semibold ${isActive ? 'text-[var(--accent-purple)]' : 'text-gray-400'}`}>
                {label}
            </span>
        </button>
    );
};

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Inicio', path: '/' },
        { icon: Package, label: 'Items', path: '/inventory' },
        { icon: ScanLine, label: 'Scan', path: '/scan' },
        { icon: Box, label: 'Cajas', path: '/boxes' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-secondary)] border-t border-white/5 flex justify-around items-center px-4 pt-2 pb-6 lg:hidden">
            {navItems.map((item) => (
                <NavItem
                    key={item.path}
                    icon={item.icon}
                    label={item.label}
                    path={item.path}
                    isActive={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                />
            ))}
        </nav>
    );
};

export default BottomNav;
