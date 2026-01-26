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
                    <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm transform hover:scale-105 transition-transform">
                        <QRCodeCanvas value={box.qrCode} size={100} />
                    </div>
                    <button className="text-xs flex items-center gap-1.5 text-gray-400 hover:text-purple-400 transition-colors font-medium">
                        <Printer size={14} /> Imprimir Etiqueta
                    </button>
                </div>

                {/* Decorative background accent */}
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

            {/* Contents List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contents.length === 0 ? (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-800 rounded-3xl bg-gray-900/50">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                            <BoxIcon size={24} />
                        </div>
                        <p className="text-gray-400 font-medium">Esta caja está vacía.</p>
                        <p className="text-gray-600 text-sm mt-1">Agrega items nuevos o mueve existentes aquí.</p>
                    </div>
                ) : (
                    contents.map(item => (
                        <div
                            key={item.id}
                            onClick={() => navigate(`/edit/${item.id}`)}
                            className="flex items-center gap-4 p-4 bg-[#242938] border border-gray-700 rounded-2xl hover:border-purple-500/50 hover:bg-[#2d3241] transition-all cursor-pointer group"
                        >
                            <div className="w-12 h-12 bg-[#1A1D29] rounded-lg flex items-center justify-center shrink-0 border border-gray-700 overflow-hidden">
                                {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <BoxIcon size={20} className="text-gray-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white truncate group-hover:text-purple-400 transition-colors text-lg">{item.name}</p>
                                <p className="text-xs text-gray-500 font-mono uppercase bg-[#1A1D29] inline-block px-1.5 py-0.5 rounded border border-gray-800 mt-1">{item.category}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Cant.</span>
                                <div className="font-mono font-bold text-white text-xl bg-[#1A1D29] px-3 py-1 rounded-lg border border-gray-700 min-w-[3rem] text-center">
                                    {item.quantity}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
