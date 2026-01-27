import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, Box as BoxIcon, Printer, X } from 'lucide-react';

export const BoxDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { boxes, getBoxContents, items, updateItem } = useInventory();
    const navigate = useNavigate();

    const [itemsToMove, setItemsToMove] = useState<string[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [moveSearchTerm, setMoveSearchTerm] = useState('');
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    const box = boxes.find(b => b.id === id);
    const contents = id ? getBoxContents(id) : [];

    // Items that are NOT in this box already
    const availableItems = items.filter(i => i.boxId !== id);

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
                    onClick={() => navigate(-1)}
                    className="mt-1 p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
                        <BoxIcon size={12} /> Contenedor
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{box.name}</h1>
                    <p className="text-gray-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        {box.location}
                    </p>
                </div>
                <div className="flex flex-col items-center gap-3 relative z-10">
                    <div id="qr-code-container" className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm transform hover:scale-105 transition-transform">
                        <QRCodeCanvas value={box.qrCode} size={100} />
                    </div>
                    <button
                        onClick={handlePrint}
                        className="text-xs flex items-center gap-1.5 text-gray-400 hover:text-purple-400 transition-colors font-medium"
                    >
                        <Printer size={14} /> Imprimir Etiqueta
                    </button>
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
