import { useInventory } from '../context/InventoryContext';
import { useNavigate } from 'react-router-dom';
import { Package, Box, Search, Plus, ScanLine, ArrowRight } from 'lucide-react';

export const Home = () => {
    const { items, boxes } = useInventory();
    const navigate = useNavigate();

    const totalItems = items.length;
    const recentItems = [...items].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5);

    const quickActions = [
        { label: 'Agregar', icon: Plus, path: '/add', color: 'purple' },
        { label: 'Escanear', icon: ScanLine, path: '/scan', color: 'teal' },
        { label: 'Inventario', icon: Search, path: '/inventory', color: 'purple' },
        { label: 'Cajas', icon: Box, path: '/boxes', color: 'teal' },
    ];

    return (
        <div className="animate-in fade-in duration-500">

            {/* HEADER */}
            <header className="mb-8">
                <p className="text-gray-400 text-sm mb-1">Bienvenida de nuevo</p>
                <h1 className="text-4xl font-bold text-white tracking-tight">Pao</h1>
            </header>

            {/* HERO / STATS */}
            <div className="stats-card mb-8 relative overflow-hidden group">
                <div className="relative z-10">
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total en Inventario</p>
                    <h2 className="text-6xl font-bold text-white mb-4 tracking-tighter">{totalItems}</h2>

                    <div className="flex gap-3">
                        <span className="inline-flex items-center gap-1 bg-emerald-400/10 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
                            <Package size={14} /> {items.length} Artículos
                        </span>
                        <span className="inline-flex items-center gap-1 bg-blue-400/10 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                            <Box size={14} /> {boxes.length} Cajas
                        </span>
                    </div>
                </div>

                {/* Decorative background blur */}
                <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl group-hover:bg-purple-600/30 transition-all duration-700"></div>
            </div>

            {/* QUICK ACTIONS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {quickActions.map((action) => (
                    <button
                        key={action.label}
                        onClick={() => navigate(action.path)}
                        className="action-btn group"
                    >
                        <div className={`w-12 h-12 rounded-full mb-3 flex items-center justify-center text-xl transition-transform duration-300 group-hover:scale-110 ${action.color === 'purple' ? 'bg-[var(--accent-purple-light)] text-[var(--accent-purple)]' : 'bg-[var(--accent-teal-light)] text-[var(--accent-teal)]'
                            }`}>
                            <action.icon size={24} />
                        </div>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">{action.label}</span>
                    </button>
                ))}
            </div>

            {/* RECENT ACTIVITY */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Agregados Recientemente</h3>
                <button onClick={() => navigate('/inventory')} className="text-sm text-[var(--accent-purple)] hover:text-white font-medium flex items-center gap-1 transition-colors">
                    Ver todo <ArrowRight size={14} />
                </button>
            </div>

            <div className="flex flex-col gap-3">
                {recentItems.length === 0 ? (
                    <div className="p-8 text-center bg-[var(--bg-secondary)] rounded-2xl border border-dashed border-gray-700">
                        <p className="text-gray-500">No hay movimientos recientes</p>
                    </div>
                ) : (
                    recentItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => navigate(`/edit/${item.id}`)}
                            className="list-item group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.quantity < 3 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                                    }`}>
                                    <Package size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white group-hover:text-[var(--accent-purple)] transition-colors">{item.name}</h4>
                                    <p className="text-xs text-gray-500">{item.category} • {item.boxId ? 'En Caja' : 'Suelto'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`font-mono font-bold text-lg ${item.quantity < 3 ? 'text-red-400' : 'text-white'}`}>
                                    {item.quantity}
                                </span>
                                <p className="text-[10px] text-gray-600 uppercase font-bold">Unidades</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
};

export default Home;
