import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import {
    Search,
    Folder,
    ChevronRight,
    Box as BoxIcon,
    Package as ItemIcon,
    Grid,
    List,
    PlusCircle,
    ArrowLeft
} from 'lucide-react';


// Updated Categories with Icons and Colors (Hardcoded for now as requested)
const CATEGORY_CONFIG: Record<string, { icon: string, color: string, label: string }> = {
    'Ropa': { icon: '👕', color: 'bg-pink-500', label: 'Ropa & Accesorios' },
    'Herramientas': { icon: '🛠️', color: 'bg-orange-500', label: 'Herramientas' },
    'Medicina': { icon: '💊', color: 'bg-red-500', label: 'Botiquín' },
    'Hogar': { icon: '🏠', color: 'bg-blue-500', label: 'Hogar & Limpieza' },
    'Electrónica': { icon: '🔌', color: 'bg-cyan-500', label: 'Electrónica' },
    'Papelería': { icon: '📝', color: 'bg-yellow-500', label: 'Papelería' },
    'Juguetes': { icon: '🧸', color: 'bg-purple-500', label: 'Juguetes' },
    'Varios': { icon: '📦', color: 'bg-gray-500', label: 'Miscelánea' },
    'Carpintería': { icon: '🪚', color: 'bg-amber-700', label: 'Carpintería' },
    'Plomería': { icon: '🚰', color: 'bg-blue-700', label: 'Plomería' },
    'Electricidad': { icon: '⚡', color: 'bg-yellow-600', label: 'Electricidad' },
    'Jardinería': { icon: '🌱', color: 'bg-green-600', label: 'Jardinería' },
    'Pintura': { icon: '🎨', color: 'bg-rose-500', label: 'Pintura' },
    'Automotriz': { icon: '🚗', color: 'bg-red-600', label: 'Automotriz' },
};

export const Explorer = () => {
    const { items, boxes } = useInventory();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Get active category from URL or null
    const activeCategory = searchParams.get('category');

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');

    const setActiveCategory = (cat: string | null) => {
        if (cat) {
            setSearchParams({ category: cat });
        } else {
            setSearchParams({});
        }
    };

    // --- LOGIC ---

    // 1. Get List of Categories from actual Items + Default Config
    const availableCategories = Array.from(new Set([
        ...Object.keys(CATEGORY_CONFIG),
        ...items.map(i => i.category)
    ])).filter(Boolean);

    // 3. Find Boxes that belong to this Category
    // This looks for:
    // A) Boxes EXPLICITLY assigned to this category
    // B) Boxes containing ITEMS of this category
    const boxesInThisCategory = activeCategory
        ? boxes.filter(box => {
            // Check direct assignment
            if (box.category === activeCategory) return true;

            // Check content inference
            const boxItems = items.filter(i => i.boxId === box.id);
            return boxItems.some(i => i.category === activeCategory);
        })
        : boxes;

    // 4. Identify IDs of boxes shown in this view
    // We use this to filter OUT items that are already inside these boxes
    // const visibleBoxIds = new Set(boxesInThisCategory.map(b => b.id));

    // 2. Filter Content based on Active Category
    // AND Exclude items that are already in the visible boxes (to avoid duplication/clutter)
    const filteredItems = activeCategory
        ? items.filter(i => {
            const matchesCategory = i.category === activeCategory;
            // Show if it matches category AND (is not in a box OR is in a box that isn't shown here?)
            // User requested: "These items are already at the Pinzas Box... clean up"
            // So, if an item is in a box, and that box is displayed above, HIDE the item from the list below.
            // Only show "Sueltos" (no box) OR items in boxes that somehow didn't make it to the list (rare edge case).
            const isLoose = !i.boxId;

            // Allow showing boxed items if the box itself isn't categorized correctly? 
            // No, simplified logic: If we show boxes, we assume the user looks there.
            // The list below is for "Loose Items" in this Category.
            return matchesCategory && isLoose;
        })
        : items;


    // Search Filtering
    const displayedItems = filteredItems.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const displayedBoxes = boxesInThisCategory.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderCategoryCard = (cat: string) => {
        const config = CATEGORY_CONFIG[cat] || { icon: '📁', color: 'bg-slate-600', label: cat };
        // Count items in this category
        const count = items.filter(i => i.category === cat).length;

        return (
            <div
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="glass-panel p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-all hover:scale-[1.02] flex flex-col gap-3 group"
            >
                <div className={`w-12 h-12 rounded-lg ${config.color}/20 flex items-center justify-center text-2xl border border-white/5 group-hover:border-${config.color.split('-')[1]}-500/50 transition-colors`}>
                    {config.icon}
                </div>
                <div>
                    <h3 className="font-bold text-white leading-tight">{config.label}</h3>
                    <p className="text-xs text-slate-400 mt-1">{count} items</p>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen pb-24 animate-in fade-in">
            {/* HEADER */}
            <div className="sticky top-0 z-30 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {activeCategory ? (
                            <button
                                onClick={() => setActiveCategory(null)}
                                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                            >
                                <ArrowLeft size={24} />
                            </button>
                        ) : (
                            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                <Folder size={24} />
                            </div>
                        )}
                        <h1 className="text-2xl font-bold text-white">
                            {activeCategory ? (CATEGORY_CONFIG[activeCategory]?.label || activeCategory) : 'Mis Categorías'}
                        </h1>
                    </div>

                    {/* View Toggle (Only in Category View) */}
                    {activeCategory && (
                        <div className="flex bg-slate-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {/* SEARCH BAR */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder={`Buscar en ${activeCategory || 'todo'}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]/50 transition-all"
                    />
                </div>
            </div>

            <div className="p-6">
                {/* LEVEL 1: CATEGORY GRID */}
                {!activeCategory ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {availableCategories.map(cat => renderCategoryCard(cat as string))}

                        {/* New Category Placeholder */}
                        <div className="glass-panel p-4 rounded-xl border-dashed border-slate-700 flex flex-col items-center justify-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                            <PlusCircle size={32} className="text-slate-500" />
                            <span className="text-xs font-medium text-slate-500">Nueva Categoría</span>
                        </div>
                    </div>
                ) : (
                    /* LEVEL 2: INSIDE A CATEGORY */
                    <div className="space-y-8">

                        {/* 1. BOXES in this Category */}
                        {displayedBoxes.length > 0 && (
                            <section>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <BoxIcon size={16} /> Cajas Relacionadas
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {displayedBoxes.map(box => (
                                        <div
                                            key={box.id}
                                            onClick={() => navigate(`/boxes/${box.id}`)}
                                            className="bg-slate-800/50 p-4 rounded-xl border border-white/5 hover:border-blue-500/50 relative overflow-hidden group cursor-pointer"
                                        >
                                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <BoxIcon size={48} className="text-blue-400" />
                                            </div>
                                            <h4 className="font-bold text-white mb-1 relative z-10">{box.name}</h4>
                                            <p className="text-xs text-slate-400 relative z-10">{box.location}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 2. ITEMS in this Category */}
                        <section>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <ItemIcon size={16} /> Artículos Sueltos & Contenidos
                            </h3>

                            {displayedItems.length === 0 ? (
                                <p className="text-slate-500 italic text-center py-8">No se encontraron artículos.</p>
                            ) : viewMode === 'grid' ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {displayedItems.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => navigate(`/edit/${item.id}`)}
                                            className="glass-panel p-3 rounded-xl hover:bg-white/5 cursor-pointer group flex flex-col gap-3"
                                        >
                                            <div className="aspect-square rounded-lg bg-slate-800 overflow-hidden flex items-center justify-center relative">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ItemIcon className="text-slate-600" size={32} />
                                                )}
                                                {item.boxId && (
                                                    <span className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded">
                                                        📦 En Caja
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-white text-sm line-clamp-2">{item.name}</h4>
                                                <p className="text-xs text-slate-500 mt-1">{item.quantity} {item.unit}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {displayedItems.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => navigate(`/edit/${item.id}`)}
                                            className="glass-panel p-3 rounded-xl flex items-center gap-4 hover:bg-white/5 cursor-pointer"
                                        >
                                            <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ItemIcon className="text-slate-600" size={16} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-white text-sm truncate">{item.name}</h4>
                                                <p className="text-xs text-slate-500">{item.quantity} {item.unit} • {item.boxId ? 'En Caja' : 'Suelto'}</p>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-600" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};
