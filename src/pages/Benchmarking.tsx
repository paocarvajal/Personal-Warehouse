import { useState, useRef } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Plus, TrendingUp, Store, Globe, ExternalLink, ArrowRight, Upload, Image as ImageIcon, Save, Trash2 } from 'lucide-react';
import type { BenchmarkItem, BenchmarkOption } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, type UploadResult } from 'firebase/storage';

export const Benchmarking = () => {
    const { benchmarks, addBenchmark, updateBenchmark, deleteBenchmark } = useInventory();
    const [isCreating, setIsCreating] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Derive selectedItem from the live benchmarks list
    const selectedItem = selectedId ? benchmarks.find(b => b.id === selectedId) || null : null;

    // New Item Form State
    const [newItemName, setNewItemName] = useState('');
    const [newItemImage, setNewItemImage] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [inputType, setInputType] = useState<'url' | 'file'>('url');
    const [status, setStatus] = useState<'idle' | 'uploading' | 'saving'>('idle');
    const [imgError, setImgError] = useState(false);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Add Option Form State (Managed separately for better control)
    const [optStoreName, setOptStoreName] = useState('');
    const [optPrice, setOptPrice] = useState('');
    const [optType, setOptType] = useState<'online' | 'physical'>('online');
    const [optUrl, setOptUrl] = useState('');

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        try {
            let finalImageUrl = newItemImage;

            // Handle File Upload
            if (inputType === 'file' && imageFile) {
                setStatus('uploading');
                const storageRef = ref(storage, `benchmarks/${Date.now()}_${imageFile.name}`);
                const uploadPromise = uploadBytes(storageRef, imageFile);
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Upload timeout")), 30000)
                );

                try {
                    const snapshot = await Promise.race([uploadPromise, timeoutPromise]) as UploadResult;
                    finalImageUrl = await getDownloadURL(snapshot.ref);
                } catch (uploadError) {
                    console.error("Upload failed:", uploadError);
                    alert("No se pudo subir la imagen (internet lento). Se creará SIN imagen.");
                    finalImageUrl = '';
                }
            }

            setStatus('saving');

            // Optimistic save
            const result = await Promise.race([
                addBenchmark({
                    name: newItemName,
                    imageUrl: finalImageUrl,
                    options: []
                }),
                new Promise(r => setTimeout(() => r("slow"), 5000))
            ]);

            if (result === "slow") {
                alert("Guardando en segundo plano. Aparecerá pronto.");
            }

            // Reset and close
            setNewItemName('');
            setNewItemImage('');
            setImageFile(null);
            setIsCreating(false);
        } catch (error) {
            console.error("Error creating:", error);
            alert("Error al guardar: " + (error as Error).message);
        } finally {
            setStatus('idle');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setImageFile(e.target.files[0]);
    };

    const handleAddOption = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Intentando guardar opción:", { optStoreName, optPrice });

        if (!selectedItem) return;
        if (!optStoreName.trim() || !optPrice.trim()) {
            alert("Por favor completa la Tienda y el Precio.");
            return;
        }

        const priceNumber = parseFloat(optPrice);
        if (isNaN(priceNumber)) {
            alert("El precio debe ser un número válido.");
            return;
        }

        if (selectedItem.options.length >= 7) {
            alert("Límite de 7 opciones alcanzado.");
            return;
        }

        const option: BenchmarkOption = {
            id: uuidv4(),
            storeName: optStoreName,
            price: priceNumber,
            type: optType,
            url: optUrl,
        };

        try {
            const updatedOptions = [...selectedItem.options, option];
            await updateBenchmark(selectedItem.id, { options: updatedOptions });

            // WE NO LONGER NEED TO MANUALLY UPDATE LOCAL STATE
            // because 'selectedItem' is derived from 'benchmarks' which updates via onSnapshot context.
            // The UI will refresh automatically when Firebase syncs back (usually ms).

            // Reset form
            setOptStoreName('');
            setOptPrice('');
            setOptType('online');
            setOptUrl('');
        } catch (err) {
            console.error(err);
            alert("Error al guardar el precio.");
        }
    };

    const handleDeleteOption = async (optionId: string) => {
        if (!selectedItem) return;
        if (!window.confirm("¿Borrar este precio?")) return;

        const updatedOptions = selectedItem.options.filter(o => o.id !== optionId);
        await updateBenchmark(selectedItem.id, { options: updatedOptions });
        // Auto-update via context inheritance
    };

    const bestPrice = (item: BenchmarkItem) => {
        if (!item.options?.length) return null;
        return Math.min(...item.options.map(o => o.price));
    };

    return (
        <div className="h-full flex flex-col p-2 md:p-6 max-w-7xl mx-auto w-full">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                            <TrendingUp size={32} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Ardilla Enloquecida</h1>
                    </div>
                    <p className="text-gray-400 text-lg">El almacén de tus mejores hallazgos.</p>
                </div>
                {!isCreating && !selectedId && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="btn btn-primary px-6 py-3 flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                    >
                        <Plus size={20} /> Nueva Cotización
                    </button>
                )}
            </div>

            {/* CONTENT */}
            <div className="flex-1 w-full">
                {isCreating ? (
                    // ---------------- CREATE FORM ----------------
                    <div className="max-w-xl mx-auto bg-[#242938] p-8 rounded-3xl border border-gray-700/50 shadow-2xl animate-in fade-in slide-in-from-bottom-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Empezar nueva cotización</h2>
                        <form onSubmit={handleCreateItem} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase mb-2">¿Qué quieres comprar?</label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full bg-[#1A1D29] border border-gray-700 rounded-xl p-4 text-white text-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-gray-600"
                                    placeholder="Ej: Monitor Gamer 27''"
                                    value={newItemName}
                                    onChange={e => setNewItemName(e.target.value)}
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-gray-400 uppercase">Imagen (Opcional)</label>
                                    <div className="flex bg-[#1A1D29] p-1 rounded-lg border border-gray-700">
                                        <button type="button" onClick={() => setInputType('url')} className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${inputType === 'url' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>URL</button>
                                        <button type="button" onClick={() => setInputType('file')} className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${inputType === 'file' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>Subir</button>
                                    </div>
                                </div>

                                {inputType === 'url' ? (
                                    <input
                                        type="url"
                                        className="w-full bg-[#1A1D29] border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-purple-500 transition-all placeholder-gray-600"
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                        value={newItemImage}
                                        onChange={e => setNewItemImage(e.target.value)}
                                    />
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full bg-[#1A1D29] border-2 border-dashed border-gray-700 hover:border-purple-500 hover:bg-gray-800 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group"
                                    >
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                        {imageFile ? (
                                            <>
                                                <ImageIcon size={40} className="text-emerald-400 mb-2" />
                                                <span className="text-emerald-400 font-medium text-sm text-center break-all">{imageFile.name}</span>
                                                <span className="text-xs text-gray-500 mt-1">Click para cambiar</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={40} className="text-gray-500 group-hover:text-purple-400 mb-2 transition-colors" />
                                                <span className="text-gray-400 group-hover:text-white font-medium">Click para subir foto</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-3 rounded-xl font-semibold text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">Cancelar</button>
                                <button
                                    type="submit"
                                    disabled={status !== 'idle'}
                                    className="flex-1 btn btn-primary py-3 rounded-xl font-bold shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {status === 'uploading' ? 'Subiendo...' : status === 'saving' ? 'Guardando...' : 'Crear Cotización'}
                                </button>
                            </div>
                        </form>
                    </div>

                ) : selectedId && selectedItem ? (
                    // ---------------- DETAILED VIEW ----------------
                    <div className="w-full animate-in fade-in slide-in-from-right-8 duration-500">
                        <button
                            onClick={() => { setSelectedId(null); setImgError(false); }}
                            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group px-4 py-2 rounded-lg hover:bg-white/5 w-fit"
                        >
                            <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={20} />
                            <span className="font-medium">Volver a la lista</span>
                        </button>

                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                            {/* LEFT COLUMN: INFO & ADD FORM (Fixed Width) */}
                            <div className="w-full lg:w-[400px] flex-shrink-0 space-y-6">

                                {/* CARD: IMAGE + DELETE */}
                                <div className="bg-[#242938] rounded-2xl border border-gray-700 overflow-hidden shadow-xl group/image relative">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file || !selectedItem) return;

                                            try {
                                                setStatus('uploading');
                                                const storageRef = ref(storage, `benchmarks/${Date.now()}_${file.name}`);

                                                // Create a timeout promise
                                                const timeoutPromise = new Promise((_, reject) =>
                                                    setTimeout(() => reject(new Error("Tiempo de espera agotado (30s). Revisa tu conexión.")), 30000)
                                                );

                                                // Race between upload and timeout
                                                const snapshot = await Promise.race([
                                                    uploadBytes(storageRef, file),
                                                    timeoutPromise
                                                ]) as any; // Cast to avoid TS issues with race types

                                                const url = await getDownloadURL(snapshot.ref);

                                                await updateBenchmark(selectedItem.id, { imageUrl: url });
                                            } catch (err: any) {
                                                console.error("Error updating image:", err);
                                                // Alert the specific error
                                                if (err.message) {
                                                    alert(`Error: ${err.message}`);
                                                } else if (err.code === 'storage/unauthorized') {
                                                    alert("Permiso denegado: No tienes acceso para subir archivos.");
                                                } else {
                                                    alert("Error desconocido al subir la imagen.");
                                                }
                                            } finally {
                                                setStatus('idle');
                                            }
                                        }}
                                    />

                                    <div
                                        className="aspect-[4/3] bg-[#1A1D29] relative flex items-center justify-center p-4 cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {status === 'uploading' && (
                                            <div className="absolute inset-0 z-20 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                                                <span className="text-sm font-medium">Subiendo...</span>
                                            </div>
                                        )}

                                        {selectedItem.imageUrl && !imgError ? (
                                            <>
                                                <img
                                                    src={selectedItem.imageUrl}
                                                    alt={selectedItem.name}
                                                    className="w-full h-full object-contain"
                                                    onError={() => setImgError(true)}
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-white font-medium flex items-center gap-2">
                                                        <Upload size={18} /> Cambiar Imagen
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-gray-600 group-hover/image:text-purple-400 transition-colors">
                                                <div className="p-4 bg-gray-800 rounded-full mb-3 group-hover/image:bg-purple-500/20 transition-colors">
                                                    <Upload size={32} />
                                                </div>
                                                <span className="text-sm font-medium">Click para agregar imagen</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1A1D29] via-[#1A1D29]/80 to-transparent p-6 pt-12 pointer-events-none">
                                            <h2 className="text-2xl font-bold text-white leading-tight shadow-black drop-shadow-sm">{selectedItem.name}</h2>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-[#2d3241] border-t border-gray-700 flex justify-end">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                                                    deleteBenchmark(selectedItem.id);
                                                    setSelectedId(null);
                                                }
                                            }}
                                            className="text-xs text-red-400 hover:text-red-200 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 size={14} /> Eliminar Producto
                                        </button>
                                    </div>
                                </div>

                                {/* ADD FORM */}
                                <div className="bg-[#242938] p-6 rounded-2xl border border-purple-500/30 shadow-[0_0_30px_rgba(108,99,255,0.1)]">
                                    <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2 pb-4 border-b border-gray-700">
                                        <div className="p-1.5 bg-purple-500/20 rounded-lg text-purple-400">
                                            <Plus size={18} />
                                        </div>
                                        Agregar Opción
                                    </h3>

                                    <form onSubmit={handleAddOption} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tienda</label>
                                            <input
                                                type="text"
                                                className="w-full bg-[#1A1D29] border border-gray-600 rounded-lg p-3 text-white focus:border-purple-500 outline-none placeholder-gray-600 transition-colors"
                                                placeholder="Ej: Amazon"
                                                value={optStoreName}
                                                onChange={e => setOptStoreName(e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Precio</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-[#1A1D29] border border-gray-600 rounded-lg pl-7 p-3 text-white focus:border-purple-500 outline-none placeholder-gray-600 transition-colors"
                                                        placeholder="0.00"
                                                        value={optPrice}
                                                        onChange={e => setOptPrice(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                                                <select
                                                    className="w-full bg-[#1A1D29] border border-gray-600 rounded-lg p-3 text-white focus:border-purple-500 outline-none cursor-pointer"
                                                    value={optType}
                                                    onChange={e => setOptType(e.target.value as 'online' | 'physical')}
                                                >
                                                    <option value="online">Online 🌐</option>
                                                    <option value="physical">Físico 🏪</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Enlace (Opcional)</label>
                                            <input
                                                type="url"
                                                className="w-full bg-[#1A1D29] border border-gray-600 rounded-lg p-3 text-xs text-gray-300 focus:border-purple-500 outline-none placeholder-gray-600 transition-colors"
                                                placeholder="https://..."
                                                value={optUrl}
                                                onChange={e => setOptUrl(e.target.value)}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full btn btn-primary py-3.5 rounded-xl font-bold text-sm shadow-md shadow-purple-500/20 hover:shadow-purple-500/40 flex items-center justify-center gap-2"
                                        >
                                            <Save size={18} /> Guardar Precio
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: LIST (Flex Grow) */}
                            <div className="flex-1 min-w-0 w-full">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-white">Comparativa de Precios</h3>
                                    <span className="bg-[#242938] border border-gray-700 px-3 py-1 rounded-full text-sm font-medium text-gray-400">
                                        {selectedItem.options.length} opciones
                                    </span>
                                </div>

                                {selectedItem.options.length === 0 ? (
                                    <div className="h-64 flex flex-col items-center justify-center bg-[#242938]/50 rounded-3xl border-2 border-dashed border-gray-700 text-center p-6">
                                        <div className="p-4 bg-gray-800 rounded-full mb-4 opacity-50">
                                            <TrendingUp size={32} className="text-gray-400" />
                                        </div>
                                        <p className="text-gray-400 font-medium text-lg">Aún no hay precios.</p>
                                        <p className="text-gray-600 text-sm mt-1">Usa el formulario de la izquierda para agregar la primera opción.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {selectedItem.options
                                            .sort((a, b) => a.price - b.price)
                                            .map((opt, idx) => (
                                                <div
                                                    key={opt.id}
                                                    className={`relative p-6 rounded-2xl border transition-all hover:translate-x-1 group
                                                        ${idx === 0
                                                            ? 'bg-gradient-to-r from-[#242938] to-emerald-900/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                                            : 'bg-[#242938] border-gray-700 hover:border-gray-600'
                                                        }`}
                                                >
                                                    {idx === 0 && (
                                                        <div className="absolute -top-3 right-6 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                                            <TrendingUp size={12} /> MEJOR PRECIO
                                                        </div>
                                                    )}

                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex items-start gap-4">
                                                            <div className={`p-3 rounded-2xl flex-shrink-0 ${opt.type === 'online' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                                                {opt.type === 'online' ? <Globe size={24} /> : <Store size={24} />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="font-bold text-xl text-white truncate">{opt.storeName}</h4>
                                                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                                    <span className="capitalize">{opt.type === 'online' ? 'Online' : 'Tienda Física'}</span>
                                                                    {opt.url && (
                                                                        <>
                                                                            <span className="text-gray-700">•</span>
                                                                            <a
                                                                                href={opt.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 truncate max-w-[200px]"
                                                                            >
                                                                                Ver enlace <ExternalLink size={12} />
                                                                            </a>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pl-14 sm:pl-0">
                                                            <div className={`text-2xl font-bold font-mono ${idx === 0 ? 'text-emerald-400' : 'text-white'}`}>
                                                                ${opt.price.toLocaleString()}
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteOption(opt.id)}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                ) : (
                    // ---------------- MAIN LIST VIEW ----------------
                    benchmarks.length === 0 ? (
                        <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-[#242938] rounded-3xl border border-gray-700 animate-in fade-in zoom-in-95">
                            <div className="w-24 h-24 bg-[#1A1D29] rounded-full flex items-center justify-center mb-6 shadow-xl border border-gray-700 text-orange-500">
                                <TrendingUp size={48} />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-4">Tu wishlist está vacía</h3>
                            <p className="text-gray-400 text-lg max-w-md mb-8">
                                Este es tu espacio personal para cotizar compras futuras. Agrega productos, compara precios y decide mejor.
                            </p>
                            <button onClick={() => setIsCreating(true)} className="btn btn-primary btn-lg px-8 py-4 text-lg shadow-xl shadow-purple-500/20 hover:scale-105 transition-transform flex items-center gap-2">
                                <Plus size={24} /> Crear primera cotización
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20 animate-in fade-in slide-in-from-bottom-4">
                            {benchmarks
                                .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
                                .map(bm => {
                                    const best = bestPrice(bm);
                                    return (
                                        <div
                                            key={bm.id}
                                            onClick={() => { setSelectedId(bm.id); setImgError(false); }}
                                            className="group bg-[#242938] rounded-2xl overflow-hidden border border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-2 relative"
                                        >

                                            {/* Edit Pencil Icon (Top Left) */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedId(bm.id);
                                                    setImgError(false);
                                                }}
                                                className="absolute top-2 left-2 z-20 bg-black/60 text-white p-1.5 rounded-full backdrop-blur-sm hover:bg-purple-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                            </button>

                                            {/* Image Area */}
                                            <div
                                                className="aspect-video bg-[#1A1D29] relative overflow-hidden"
                                                onClick={(e) => {
                                                    if (bm.imageUrl) {
                                                        e.stopPropagation();
                                                        setZoomedImage(bm.imageUrl);
                                                    }
                                                }}
                                            >
                                                {bm.imageUrl ? (
                                                    <img
                                                        src={bm.imageUrl}
                                                        alt={bm.name}
                                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-600 group-hover:bg-[#2d3241] transition-colors">
                                                        <TrendingUp size={32} />
                                                    </div>
                                                )}

                                                {/* Hover Overlay - ONLY if no image, or smaller since image is clickable now */}
                                                {!bm.imageUrl && (
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                        <span className="bg-white text-black font-bold px-5 py-2.5 rounded-full text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-lg flex items-center gap-2">
                                                            Ver Detalles <ArrowRight size={16} />
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white z-10 border border-white/10 pointer-events-none">
                                                    {bm.options.length} OPCIONES
                                                </div>
                                            </div>

                                            {/* Content Area */}
                                            <div className="p-5">
                                                <h3 className="font-bold text-lg mb-2 truncate text-gray-200 group-hover:text-purple-400 transition-colors">{bm.name}</h3>
                                                {best !== null ? (
                                                    <div className="flex items-center gap-2 bg-emerald-500/10 w-fit px-3 py-1 rounded-lg border border-emerald-500/20">
                                                        <span className="text-[10px] uppercase font-bold text-emerald-500/70">Mejor:</span>
                                                        <span className="text-emerald-400 font-mono font-bold text-lg tracking-tight">${best.toLocaleString()}</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-500 text-xs font-medium italic py-1.5 px-1">Sin precios registrados</div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    )
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
