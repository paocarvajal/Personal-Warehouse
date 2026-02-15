import React, { useState, useRef, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Box as BoxIcon, Plus, MapPin, Printer } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Link, useNavigate } from 'react-router-dom';

// @ts-ignore
import { Responsive } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Custom hook to get width (since WidthProvider import is flaky)
const useContainerWidth = (ref: React.RefObject<HTMLDivElement | null>) => {
    const [width, setWidth] = useState(1200);

    useEffect(() => {
        if (!ref.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setWidth(entry.contentRect.width);
            }
        });

        resizeObserver.observe(ref.current);
        setWidth(ref.current.offsetWidth); // Initial

        return () => resizeObserver.disconnect();
    }, [ref]);

    return width;
};

export const BoxList = () => {
    const { boxes, addBox, deleteBox } = useInventory();
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);
    const [newBoxData, setNewBoxData] = useState({ name: '', location: '', description: '', category: '' });
    const [selectedBoxIds, setSelectedBoxIds] = useState<string[]>([]);
    const [boxSearchTerm, setBoxSearchTerm] = useState('');

    // Drag and Drop Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const containerWidth = useContainerWidth(containerRef);
    const isDraggingRef = useRef(false);

    const filteredBoxes = boxes.filter(box =>
        box.name.toLowerCase().includes(boxSearchTerm.toLowerCase()) ||
        box.location.toLowerCase().includes(boxSearchTerm.toLowerCase()) ||
        (box.category && box.category.toLowerCase().includes(boxSearchTerm.toLowerCase()))
    );

    // --- LAYOUT LOGIC ---
    const getSavedLayout = () => {
        try {
            const saved = localStorage.getItem('box_layout');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    };

    const savedLayouts = getSavedLayout();

    const generateLayouts = (items: { id: string }[]) => {
        return items.map((item, i) => ({
            i: item.id,
            x: i % 4,
            y: Math.floor(i / 4),
            w: 1,
            h: 1
        }));
    };

    // Merge saved layout with current boxes (handle new/deleted boxes)
    const currentLayoutVariables = (() => {
        const layoutMap = new Map((savedLayouts?.lg || generateLayouts(boxes)).map((l: any) => [l.i, l]));
        let maxY = 0;
        if (savedLayouts?.lg) {
            savedLayouts.lg.forEach((l: any) => {
                if (l.y >= maxY) maxY = l.y + 1;
            });
        }

        const finalLayout: any[] = [];
        boxes.forEach((box, index) => {
            if (layoutMap.has(box.id)) {
                finalLayout.push(layoutMap.get(box.id));
            } else {
                finalLayout.push({
                    i: box.id,
                    x: (finalLayout.length % 4),
                    y: maxY + Math.floor(index / 4),
                    w: 1,
                    h: 1
                });
            }
        });
        return finalLayout;
    })();

    const [layouts, setLayouts] = useState({ lg: currentLayoutVariables, md: currentLayoutVariables, sm: currentLayoutVariables });

    // Sync layouts when boxes change (e.g. added new box)
    useEffect(() => {
        const newLayout = (() => {
            const layoutMap = new Map(layouts.lg.map((l: any) => [l.i, l]));
            let maxY = 0;
            layouts.lg.forEach((l: any) => {
                if (l.y >= maxY) maxY = l.y + 1;
            });

            const finalLayout: any[] = [];
            boxes.forEach((box) => {
                if (layoutMap.has(box.id)) {
                    finalLayout.push(layoutMap.get(box.id));
                } else {
                    finalLayout.push({
                        i: box.id,
                        x: (finalLayout.length % 4),
                        y: maxY + 1, // Add to bottom
                        w: 1,
                        h: 1
                    });
                }
            });
            return finalLayout;
        })();

        setLayouts({ lg: newLayout, md: newLayout, sm: newLayout });
    }, [boxes.length]); // Only re-calc on length diff to avoid loops


    const onLayoutChange = (_layout: any, allLayouts: any) => {
        setLayouts(allLayouts);
        localStorage.setItem('box_layout', JSON.stringify(allLayouts));
    };

    // Categories for selection (same as Explorer)
    const PREDEFINED_CATEGORIES = [
        'Ropa', 'Herramientas', 'Medicina', 'Hogar', 'Electrónica',
        'Papelería', 'Juguetes', 'Varios', 'Carpintería', 'Plomería',
        'Electricidad', 'Jardinería', 'Pintura', 'Automotriz'
    ];

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        addBox(newBoxData);
        setIsCreating(false);
        setNewBoxData({ name: '', location: '', description: '', category: '' });
    };

    const toggleSelection = (id: string) => {
        setSelectedBoxIds(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleBulkPrint = () => {
        navigate('/print-labels', { state: { boxIds: selectedBoxIds } });
    };

    return (
        <div className="max-w-7xl mx-auto p-6 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-10">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Gestión de Cajas</h1>
                    <p className="text-gray-400 mt-1">{boxes.length} Contenedores registrados</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/import')}
                        className="btn bg-[#242938] border border-gray-700 hover:bg-gray-800 text-gray-300 font-bold px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
                    >
                        Importar Excel
                    </button>
                    {!isCreating && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="btn btn-primary px-6 py-3 rounded-xl font-bold custom-shadow hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            <Plus size={20} /> Nueva Caja
                        </button>
                    )}
                </div>
            </div>

            {/* Create Form */}
            {isCreating && (
                <div className="max-w-2xl mx-auto mb-12 bg-[#242938] rounded-2xl border border-gray-700 shadow-xl overflow-hidden animate-in slide-in-from-top-4 fade-in">
                    <div className="p-6 border-b border-gray-700 bg-[#2d3241]/50">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                <BoxIcon size={20} />
                            </div>
                            Registrar Nueva Caja
                        </h3>
                    </div>
                    <form onSubmit={handleCreate} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-400 font-bold text-sm uppercase mb-2">Nombre / ID</label>
                                <input
                                    required
                                    autoFocus
                                    placeholder="Ej. Caja A1 - Eléctricos"
                                    className="w-full bg-[#1A1D29] border border-gray-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all placeholder-gray-600"
                                    value={newBoxData.name}
                                    onChange={e => setNewBoxData({ ...newBoxData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 font-bold text-sm uppercase mb-2">Ubicación Física</label>
                                <input
                                    required
                                    placeholder="Ej. Estante 2, Repisa Superior"
                                    className="w-full bg-[#1A1D29] border border-gray-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all placeholder-gray-600"
                                    value={newBoxData.location}
                                    onChange={e => setNewBoxData({ ...newBoxData, location: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-gray-400 font-bold text-sm uppercase mb-2">Categoría Principal (Opcional)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {PREDEFINED_CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setNewBoxData({ ...newBoxData, category: newBoxData.category === cat ? '' : cat })}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${newBoxData.category === cat
                                                ? 'bg-purple-600 text-white border-purple-500 shadow-md transform scale-105'
                                                : 'bg-[#1A1D29] text-gray-400 border-gray-700 hover:border-gray-500'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-purple-500/20"
                            >
                                Guardar Caja
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search Bar & Selection Toolbar */}
            <div className="mb-6 space-y-4">
                {/* Search Input */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl leading-5 bg-[#1A1D29] text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-[#242938] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:text-sm transition-colors"
                        placeholder="Buscar cajas por nombre o ubicación..."
                        value={boxSearchTerm}
                        onChange={(e) => setBoxSearchTerm(e.target.value)}
                    />
                </div>

                {selectedBoxIds.length > 0 && (
                    <div className="bg-purple-600/10 border border-purple-500/20 p-4 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-purple-200">
                                {selectedBoxIds.length} Cajas Seleccionadas
                            </span>
                            <button
                                onClick={() => setSelectedBoxIds([])}
                                className="text-sm text-purple-400 hover:text-white underline"
                            >
                                Limpiar
                            </button>
                        </div>
                        <button
                            onClick={handleBulkPrint}
                            className="btn bg-purple-500 text-white font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-purple-400"
                        >
                            <Printer size={18} />
                            Imprimir {selectedBoxIds.length} Etiquetas
                        </button>
                    </div>
                )}
            </div>

            {/* Grid */}
            <div ref={containerRef} className="pb-20">
                {boxes.length === 0 && !isCreating ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center text-gray-500 bg-[#242938] rounded-3xl border border-dashed border-gray-700">
                        <div className="w-24 h-24 bg-[#1A1D29] rounded-full flex items-center justify-center mb-6">
                            <BoxIcon size={40} className="opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No hay cajas registradas</h3>
                        <p className="text-gray-400 mb-8 max-w-md">Organiza tu inventario creando cajas y contenedores para agrupar tus artículos.</p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="btn btn-primary px-8 py-3 rounded-xl font-bold flex items-center gap-2"
                        >
                            <Plus size={20} /> Crear primera caja
                        </button>
                    </div>
                ) : (
                    filteredBoxes.length === 0 ? (
                        <div className="py-20 text-center text-gray-500">
                            No se encontraron cajas que coincidan con tu búsqueda.
                        </div>
                    ) : (
                        // If searching, show updated filtered items in grid (Search breaks manual layout usually, but we can fallback or try to keep positions)
                        // For simplicity in search mode, users often just want results. 
                        // But if they want to REORDER, they probably aren't searching. 
                        // Let's show Grid Layout ONLY when NOT searching strictly? 
                        // Or we can just filter the keys passed to ResponsiveGridLayout.

                        boxSearchTerm ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredBoxes.map(box => (
                                    <div
                                        key={box.id}
                                        className={`group bg-[#242938] border rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col h-full relative overflow-hidden ${selectedBoxIds.includes(box.id) ? 'border-purple-500 shadow-purple-500/20' : 'border-gray-700 hover:border-purple-500/50'}`}
                                    >
                                        <div className="absolute top-4 left-4 z-20">
                                            <label className="custom-checkbox flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded border-gray-600 bg-[#1A1D29] text-purple-500 focus:ring-purple-500"
                                                    checked={selectedBoxIds.includes(box.id)}
                                                    onChange={() => toggleSelection(box.id)}
                                                />
                                            </label>
                                        </div>

                                        <div className="flex justify-between items-start mb-4 relative z-10 pl-8">
                                            <div className="min-w-0 pr-2">
                                                <h3 className="font-bold text-white text-xl truncate group-hover:text-purple-400 transition-colors">{box.name}</h3>
                                                <p className="flex items-center gap-1.5 text-sm text-gray-400 mt-1">
                                                    <MapPin size={14} className="text-gray-500" />
                                                    {box.location}
                                                </p>
                                            </div>
                                            <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                                                <QRCodeCanvas value={box.qrCode} size={48} />
                                            </div>
                                        </div>

                                        <div className="mt-auto grid grid-cols-[1fr_auto] gap-3">
                                            <Link
                                                to={`/boxes/${box.id}`}
                                                className="bg-[#1A1D29] hover:bg-gray-800 text-gray-300 hover:text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-center text-sm flex items-center justify-center"
                                            >
                                                Ver Contenido
                                            </Link>
                                            <button
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                                onClick={() => deleteBox(box.id)}
                                                title="Eliminar caja"
                                            >
                                                <Plus size={20} className="rotate-45" />
                                            </button>
                                        </div>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-600/10 transition-colors pointer-events-none"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Responsive
                                className="layout"
                                layouts={layouts}
                                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                                cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
                                rowHeight={180}
                                margin={[24, 24]}
                                width={containerWidth}
                                onLayoutChange={onLayoutChange}
                                onDragStart={() => { isDraggingRef.current = true; }}
                                onDragStop={() => { setTimeout(() => { isDraggingRef.current = false; }, 200); }}
                                draggableCancel=".no-drag"
                                {...{ isDraggable: true, isResizable: false } as any}
                            >
                                {boxes.map(box => (
                                    <div
                                        key={box.id}
                                        className={`group bg-[#242938] border rounded-2xl p-5 flex flex-col h-full relative overflow-hidden cursor-grab active:cursor-grabbing ${selectedBoxIds.includes(box.id) ? 'border-purple-500 shadow-purple-500/20' : 'border-gray-700 hover:border-purple-500/50'}`}
                                    >
                                        {/* Selection Checkbox */}
                                        <div className="absolute top-4 left-4 z-20 no-drag" onMouseDown={e => e.stopPropagation()}>
                                            <label className="custom-checkbox flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded border-gray-600 bg-[#1A1D29] text-purple-500 focus:ring-purple-500"
                                                    checked={selectedBoxIds.includes(box.id)}
                                                    onChange={() => toggleSelection(box.id)}
                                                />
                                            </label>
                                        </div>

                                        <div className="flex justify-between items-start mb-4 relative z-10 pl-8 pointer-events-none">
                                            <div className="min-w-0 pr-2">
                                                <h3 className="font-bold text-white text-xl truncate group-hover:text-purple-400 transition-colors">{box.name}</h3>
                                                <p className="flex items-center gap-1.5 text-sm text-gray-400 mt-1">
                                                    <MapPin size={14} className="text-gray-500" />
                                                    {box.location}
                                                </p>
                                            </div>
                                            <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                                                <QRCodeCanvas value={box.qrCode} size={48} />
                                            </div>
                                        </div>

                                        <div className="mt-auto grid grid-cols-[1fr_auto] gap-3 no-drag" onMouseDown={e => e.stopPropagation()}>
                                            <div onClick={(e) => {
                                                if (isDraggingRef.current) { e.preventDefault(); return; }
                                                navigate(`/boxes/${box.id}`);
                                            }}
                                                className="bg-[#1A1D29] hover:bg-gray-800 text-gray-300 hover:text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-center text-sm flex items-center justify-center cursor-pointer"
                                            >
                                                Ver Contenido
                                            </div>
                                            <button
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                                onClick={() => deleteBox(box.id)}
                                                title="Eliminar caja"
                                            >
                                                <Plus size={20} className="rotate-45" />
                                            </button>
                                        </div>

                                        {/* Decorative background accent */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-600/10 transition-colors pointer-events-none"></div>
                                    </div>
                                ))}
                            </Responsive>
                        )
                    )
                )}
            </div>
        </div>
    );
};
