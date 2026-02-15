import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, Box as BoxIcon, Printer, X, Trash2, Edit2, Save } from 'lucide-react';

export const BoxDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { boxes, getBoxContents, items, updateItem, deleteBox, updateBox } = useInventory();
    const navigate = useNavigate();

    const [itemsToMove, setItemsToMove] = useState<string[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [moveSearchTerm, setMoveSearchTerm] = useState('');
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    // Create local editable state
    const [isEditing, setIsEditing] = useState(false);
    const box = boxes.find(b => b.id === id);
    const [editForm, setEditForm] = useState({ name: '', location: '', description: '', category: '' });

    // Categories for selection
    const PREDEFINED_CATEGORIES = [
        'Ropa', 'Herramientas', 'Medicina', 'Hogar', 'Electrónica',
        'Papelería', 'Juguetes', 'Varios', 'Carpintería', 'Plomería',
        'Electricidad', 'Jardinería', 'Pintura', 'Automotriz'
    ];

    useEffect(() => {
        if (box) {
            setEditForm({
                name: box.name,
                location: box.location,
                description: box.description || '',
                category: box.category || ''
            });
        }
    }, [box]);

    const handleSaveBox = () => {
        if (!box) return;
        if (updateBox) {
            updateBox(box.id, editForm);
            setIsEditing(false);
        } else {
            console.error('UpdateBox missing');
        }
    };

    const handleBack = () => {
        // If there is state from where we came, we can check it, but currently navigate(-1) works well with the new URL params explorer
        navigate(-1);
    };

    const toggleItemToMove = (itemId: string) => {
        setItemsToMove(prev =>
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    const handleBulkMoveToBox = async () => {
        if (itemsToMove.length === 0 || !id) return;

        await Promise.all(itemsToMove.map(itemId => updateItem(itemId, { boxId: id })));

        setItemsToMove([]);
        setIsAddModalOpen(false);
        setMoveSearchTerm('');
    };

    const contents = id ? getBoxContents(id) : [];

    // Items that are NOT in this box already
    const availableItems = items.filter(i => i.boxId !== id);

    const filteredAvailableItems = availableItems.filter(item =>
        item.name.toLowerCase().includes(moveSearchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(moveSearchTerm.toLowerCase())
    );

    // Group items by category
    const groupedContents = contents.reduce((acc, item) => {
        const category = item.category || 'Sin Categoría';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {} as Record<string, typeof contents>);

    const sortedCategories = Object.keys(groupedContents).sort();

    const handlePrint = () => {
        if (!box) return;
        const canvas = document.querySelector('#qr-code-container canvas') as HTMLCanvasElement;
        if (!canvas) return;
        const pngUrl = canvas.toDataURL("image/png");

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Etiqueta ${box.name}</title>
                        <style>
                        body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
                        .qr-container { border: 2px solid black; padding: 20px; text-align: center; border-radius: 10px; }
                        img { width: 200px; height: 200px; display: block; margin: 0 auto 10px; }
                        h2 { margin: 0; font-size: 24px; font-weight: bold; }
                        p { margin: 5px 0 0; font-size: 14px; color: #555; }
                    </style>
                </head>
                <body>
                    <div class="qr-container"><img src="${pngUrl}" /><h2>${box.name}</h2><p>${box.location}</p></div>
                    <script>window.onload = () => { window.print(); }</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (!box) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl">Caja no encontrada</h2>
                <Link to="/boxes" className="text-[var(--color-primary)]">Volver a lista</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in slide-in-from-right-4 duration-500 space-y-8">
            {/* Image Zoom Modal */}
            {zoomedImage && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setZoomedImage(null)}
                >
                    <img
                        src={zoomedImage}
                        alt="Zoomed Item"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    />
                    <div className="absolute top-4 right-4 text-white/50 text-sm">Click para cerrar</div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-6 bg-[#242938] p-6 rounded-3xl border border-gray-700 shadow-xl relative overflow-hidden">
                <button
                    onClick={handleBack}
                    className="mt-1 p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1 relative z-10">
                    {isEditing ? (
                        <div className="space-y-4 max-w-lg bg-black/20 p-4 rounded-xl border border-white/10">
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Nombre</label>
                                <input
                                    className="w-full bg-[#1A1D29] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Ubicación</label>
                                <input
                                    className="w-full bg-[#1A1D29] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none"
                                    value={editForm.location}
                                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Descripción</label>
                                <input
                                    className="w-full bg-[#1A1D29] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none"
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Categoría</label>
                                <div className="flex flex-wrap gap-2">
                                    {PREDEFINED_CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setEditForm({ ...editForm, category: editForm.category === cat ? '' : cat })}
                                            className={`text-xs px-2 py-1 rounded-md border transition-all ${editForm.category === cat
                                                ? 'bg-purple-600 text-white border-purple-500'
                                                : 'bg-[#1A1D29] text-gray-400 border-gray-700 hover:border-gray-500'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleSaveBox}
                                    className="btn bg-[var(--accent-purple)] hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                                >
                                    <Save size={16} /> Guardar
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="btn bg-transparent border border-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/5"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
                                    <BoxIcon size={12} /> Contenedor
                                </div>
                                {box.category && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
                                        📌 {box.category}
                                    </div>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{box.name}</h1>
                            <p className="text-gray-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                {box.location}
                            </p>
                            {box.description && (
                                <p className="text-gray-500 text-sm mt-2">{box.description}</p>
                            )}
                        </>
                    )}
                </div>
                <div className="flex flex-col items-center gap-3 relative z-10">
                    <div id="qr-code-container" className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm transform hover:scale-105 transition-transform">
                        <QRCodeCanvas value={box.qrCode} size={100} />
                    </div>
                    {!isEditing && (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-xs flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors font-medium mt-1"
                            >
                                <Edit2 size={14} /> Editar
                            </button>
                            <button
                                onClick={handlePrint}
                                className="text-xs flex items-center gap-1.5 text-gray-400 hover:text-purple-400 transition-colors font-medium"
                            >
                                <Printer size={14} /> Imprimir Etiqueta
                            </button>
                            <button
                                onClick={async () => {
                                    if (confirm('¿Estás seguro de eliminar esta caja? Los artículos quedarán "sueltos".')) {
                                        for (const item of contents) {
                                            await updateItem(item.id, { boxId: null });
                                        }
                                        await deleteBox(box.id);
                                        navigate('/boxes');
                                    }
                                }}
                                className="text-xs flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors font-medium mt-1"
                            >
                                <Trash2 size={14} /> Eliminar Caja
                            </button>
                        </>
                    )}
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-800 pb-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Contenido
                    <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded-lg text-sm">{contents.length}</span>
                </h2>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex-1 sm:flex-none btn bg-[#242938] hover:bg-gray-700 border border-gray-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                    >
                        📥 Mover existentes aquí
                    </button>
                    <Link to={`/add?boxId=${box.id}`} className="flex-1 sm:flex-none btn btn-primary px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                        <BoxIcon size={16} /> Crear nuevo item
                    </Link>
                </div>
            </div>

            {/* Add Existing Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-[#242938] rounded-2xl border border-gray-700 shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh]">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Mover ítems a {box.name}</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>

                        <div className="p-4 border-b border-gray-700 bg-[#1A1D29]">
                            <input
                                type="text"
                                autoFocus
                                placeholder="Buscar artículo por nombre..."
                                className="w-full bg-[#242938] border border-gray-700 rounded-xl p-3 text-white focus:border-purple-500 outline-none"
                                value={moveSearchTerm}
                                onChange={e => setMoveSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {filteredAvailableItems.length === 0 ? (
                                <div className="text-center text-gray-500 py-10">No hay ítems disponibles.</div>
                            ) : (
                                filteredAvailableItems.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleItemToMove(item.id)}
                                        className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${itemsToMove.includes(item.id)
                                            ? 'bg-purple-500/20 border-purple-500'
                                            : 'bg-[#1A1D29] border-gray-700 hover:border-gray-500'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${itemsToMove.includes(item.id) ? 'bg-purple-500 border-purple-500' : 'border-gray-500'}`}>
                                            {itemsToMove.includes(item.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-white text-sm">{item.name}</p>
                                            <p className="text-xs text-gray-400 flex items-center gap-2">
                                                {item.category} • {item.boxId ? '📦 En otra caja' : '📌 Suelto'}
                                            </p>
                                        </div>
                                        {item.imageUrl && <img src={item.imageUrl} className="w-8 h-8 rounded object-cover" />}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-700 flex gap-3 bg-[#242938] rounded-b-2xl">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleBulkMoveToBox}
                                disabled={itemsToMove.length === 0}
                                className="flex-1 btn btn-primary py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Mover {itemsToMove.length} Ítems Aquí
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contents List (Grouped) */}
            <div className="space-y-8">
                {contents.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-gray-800 rounded-3xl bg-gray-900/50">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                            <BoxIcon size={24} />
                        </div>
                        <p className="text-gray-400 font-medium">Esta caja está vacía.</p>
                        <p className="text-gray-600 text-sm mt-1">Agrega items nuevos o mueve existentes aquí.</p>
                    </div>
                ) : (
                    sortedCategories.map(category => (
                        <div key={category} className="space-y-3">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2 border-l-4 border-purple-500">
                                {category} ({groupedContents[category].length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {groupedContents[category].map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => navigate(`/edit/${item.id}`)}
                                        className="flex items-center gap-4 p-4 bg-[#242938] border border-gray-700 rounded-2xl hover:border-purple-500/50 hover:bg-[#2d3241] transition-all cursor-pointer group"
                                    >
                                        <div
                                            className="w-12 h-12 bg-[#1A1D29] rounded-lg flex items-center justify-center shrink-0 border border-gray-700 overflow-hidden cursor-zoom-in relative z-10 hover:ring-2 hover:ring-purple-500 transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Stop navigation
                                                if (item.imageUrl) setZoomedImage(item.imageUrl);
                                            }}
                                        >
                                            {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <BoxIcon size={20} className="text-gray-600" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white truncate group-hover:text-purple-400 transition-colors text-lg">{item.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{item.description}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Cant.</span>
                                            <div className="font-mono font-bold text-white text-xl bg-[#1A1D29] px-3 py-1 rounded-lg border border-gray-700 min-w-[3rem] text-center">
                                                {item.quantity}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
