import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, Box as BoxIcon, Printer } from 'lucide-react';

export const BoxDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { boxes, getBoxContents, items, updateItem } = useInventory();
    const navigate = useNavigate();
    const [selectedItemId, setSelectedItemId] = useState('');

    const box = boxes.find(b => b.id === id);
    const contents = id ? getBoxContents(id) : [];

    // Items that are NOT in this box already
    const availableItems = items.filter(i => i.boxId !== id);

    const handleMoveItem = () => {
        if (!selectedItemId || !id) return;
        updateItem(selectedItemId, { boxId: id });
        setSelectedItemId('');
    };

    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    // Group items by category
    const groupedContents = contents.reduce((acc, item) => {
        const category = item.category || 'Sin Categoría';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {} as Record<string, typeof contents>);

    const sortedCategories = Object.keys(groupedContents).sort();

    // ... (handleMoveItem and handlePrint remain unchanged, but skipping them here for brevity if I include the whole return)

    // NOTE: I am replacing the return block primarily.
    // Let's replace the whole component content to be safe and clean.

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

            {/* Search / Add Contextual */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-800 pb-2">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        Contenido
                        <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded-lg text-sm">{contents.length}</span>
                    </h2>
                    <Link to={`/add?boxId=${box.id}`} className="btn btn-primary px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                        <BoxIcon size={16} /> Agregar nuevo item aquí
                    </Link>
                </div>

                {/* Quick Add Existing Item */}
                <div className="bg-[#242938]/50 p-4 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                    <label className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 block">
                        Mover artículo existente a esta caja:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <select
                                className="w-full bg-[#1A1D29] border border-gray-700 rounded-xl px-4 py-3 text-white appearance-none focus:border-purple-500 outline-none transition-all cursor-pointer text-sm"
                                value={selectedItemId}
                                onChange={(e) => setSelectedItemId(e.target.value)}
                            >
                                <option value="">-- Buscar artículo para mover... --</option>
                                {availableItems.map(item => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} {item.boxId ? '📦 (En otra caja)' : '📌 (Sin caja)'}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                            </div>
                        </div>

                        <button
                            disabled={!selectedItemId}
                            onClick={handleMoveItem}
                            className="btn bg-gray-700 hover:bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
                        >
                            Mover Aquí
                        </button>
                    </div>
                </div>
            </div>

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
