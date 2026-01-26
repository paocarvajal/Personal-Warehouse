import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Search, Package } from 'lucide-react';
import type { Category } from '../types';
import { useNavigate } from 'react-router-dom';

export const Inventory = () => {
    const { items, boxes } = useInventory();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const getBoxName = (boxId?: string) => {
        if (!boxId) return 'Suelto';
        const box = boxes.find(b => b.id === boxId);
        return box ? box.name : 'Caja desconocida';
    };

    return (
        <div className="max-w-7xl mx-auto p-6 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Inventario General</h1>
                    <p className="text-gray-400 mt-1">{items.length} Artículos registrados</p>
                </div>
                <button
                    onClick={() => navigate('/add')}
                    className="btn btn-primary px-6 py-3 rounded-xl font-bold custom-shadow hover:scale-105 transition-transform flex items-center gap-2"
                >
                    <Package size={20} /> Nuevo Artículo
                </button>
            </div>

            {/* Controls */}
            <div className="space-y-6 mb-8">
                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" size={22} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, caja o etiquetas..."
                        className="w-full bg-[#242938] border border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-white text-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all shadow-lg"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Categories */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setCategoryFilter('All')}
                        className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${categoryFilter === 'All'
                            ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/30'
                            : 'bg-[#242938] border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                            }`}
                    >
                        Todo
                    </button>
                    {['Carpintería', 'Plomería', 'Electricidad', 'Jardinería', 'Pintura', 'Automotriz', 'Varios'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat as Category)}
                            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${categoryFilter === cat
                                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/30'
                                : 'bg-[#242938] border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                {filteredItems.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center text-gray-500">
                        <div className="w-20 h-20 bg-[#242938] rounded-full flex items-center justify-center mb-4">
                            <Search size={32} className="opacity-50" />
                        </div>
                        <p className="text-lg font-medium text-gray-400">No encontramos lo que buscas.</p>
                        <p className="text-sm mt-1 mb-6">Prueba con otros términos o agrega un nuevo ítem.</p>
                        <button
                            onClick={() => navigate('/add')}
                            className="bg-[#242938] hover:bg-[#2d3241] text-purple-400 font-bold py-2 px-6 rounded-lg transition-colors border border-gray-700"
                        >
                            + Agregar nuevo ítem
                        </button>
                    </div>
                ) : (
                    filteredItems.map(item => (
                        <div
                            onClick={() => navigate(`/product/${item.id}`)}
                            key={item.id}
                            className="group bg-[#242938] border border-gray-700 hover:border-purple-500/50 rounded-2xl p-4 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl relative overflow-hidden"
                        >
                            {/* Edit Pencil Icon (Top Left) */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/edit/${item.id}`);
                                }}
                                className="absolute top-2 left-2 z-20 bg-black/60 text-white p-1.5 rounded-full backdrop-blur-sm hover:bg-purple-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>

                            <div className="flex items-start gap-4">
                                {/* Image or Icon */}
                                <div
                                    className="w-16 h-16 rounded-xl bg-[#1A1D29] flex-shrink-0 overflow-hidden border border-gray-700 group-hover:border-gray-600 transition-colors relative z-10"
                                    onClick={(e) => {
                                        if (item.imageUrl) {
                                            e.stopPropagation();
                                            setZoomedImage(item.imageUrl);
                                        }
                                    }}
                                >
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            <Package size={24} />
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-white truncate text-lg leading-tight mb-1 group-hover:text-purple-400 transition-colors">
                                        {item.name}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                                        <span className="bg-[#1A1D29] px-2 py-0.5 rounded-md border border-gray-700">
                                            {item.category}
                                        </span>
                                        {item.boxId ? (
                                            <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                                <span>📦</span> {getBoxName(item.boxId)}
                                            </span>
                                        ) : (
                                            <span className="text-gray-600 italic">Suelto</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cantidad</span>
                                <span className={`text-xl font-mono font-bold ${item.quantity < 3 ? 'text-red-400' : 'text-white'}`}>
                                    {item.quantity}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ZOOM MODAL */}
            {zoomedImage && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setZoomedImage(null)}
                >
                    <img
                        src={zoomedImage}
                        alt="Zoomed"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setZoomedImage(null)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            )}
        </div>
    );
};
