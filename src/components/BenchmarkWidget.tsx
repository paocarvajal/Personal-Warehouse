import { useState, useRef } from 'react';
import { useInventory } from '../context/InventoryContext';
import type { Benchmark } from '../types';
import { Plus, Globe, Store, ExternalLink, Trash2, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const BenchmarkWidget = () => {
    const { items, updateItem } = useInventory();
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [isAdding, setIsAdding] = useState(false);
    const [newBenchmark, setNewBenchmark] = useState<Partial<Benchmark>>({ type: 'online' });

    // Image handling states
    const [imageSource, setImageSource] = useState<'url' | 'file'>('url');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedItem = items.find(i => i.id === selectedItemId);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleAddBenchmark = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem || !newBenchmark.storeName || !newBenchmark.price) return;

        try {
            setUploading(true);
            let finalImageUrl = newBenchmark.imageUrl;

            if (imageSource === 'file' && selectedFile) {
                const imageRef = ref(storage, `benchmarks/${selectedItem.id}/${Date.now()}_${selectedFile.name}`);
                const snapshot = await uploadBytes(imageRef, selectedFile);
                finalImageUrl = await getDownloadURL(snapshot.ref);
            }

            const benchmark: Benchmark = {
                id: uuidv4(),
                storeName: newBenchmark.storeName,
                url: newBenchmark.url,
                price: Number(newBenchmark.price),
                type: newBenchmark.type as 'online' | 'physical',
                imageUrl: finalImageUrl
            };

            const currentBenchmarks = selectedItem.benchmarks || [];
            // Limit to 7 as requested
            if (currentBenchmarks.length >= 7) {
                alert("Máximo 7 comparaciones permitidas por producto.");
                return;
            }

            updateItem(selectedItem.id, {
                benchmarks: [...currentBenchmarks, benchmark]
            });

            // Reset form
            setIsAdding(false);
            setNewBenchmark({ type: 'online' });
            setSelectedFile(null);
            setImageSource('url');
        } catch (error) {
            console.error("Error adding benchmark:", error);
            alert("Error al guardar la comparación. Por favor intenta de nuevo.");
        } finally {
            setUploading(false);
        }
    };

    const removeBenchmark = (benchmarkId: string) => {
        if (!selectedItem) return;
        updateItem(selectedItem.id, {
            benchmarks: selectedItem.benchmarks?.filter(b => b.id !== benchmarkId)
        });
    };

    // Calculate stats
    const bestPrice = selectedItem?.benchmarks?.length
        ? Math.min(...selectedItem.benchmarks.map(b => b.price))
        : 0;

    return (
        <div className="h-full flex flex-col p-4 bg-[var(--color-surface)] text-[var(--color-text)] relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Comparador</h3>
                        <p className="text-xs text-[var(--color-text-muted)]">Precios y Ubicaciones</p>
                    </div>
                </div>

                <select
                    className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-1 text-sm outline-none focus:border-[var(--color-primary)] max-w-[200px]"
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                >
                    <option value="">Seleccionar Producto...</option>
                    {items.map(item => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                </select>
            </div>

            {!selectedItem ? (
                <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-text-muted)] opacity-50">
                    <TrendingDown className="w-12 h-12 mb-2" />
                    <p>Selecciona un producto para comparar</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Item Info Summary */}
                    <div className="flex items-center gap-4 mb-4 p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                        {selectedItem.imageUrl ? (
                            <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                            <div className="w-12 h-12 rounded-lg bg-[var(--color-surface-hover)] flex items-center justify-center">
                                <span className="text-xl font-bold text-[var(--color-text-muted)]">{selectedItem.name.charAt(0)}</span>
                            </div>
                        )}
                        <div>
                            <h4 className="font-semibold px-1">{selectedItem.name}</h4>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                    Stock: {selectedItem.quantity}
                                </span>
                                {bestPrice > 0 && (
                                    <span className="text-green-500 font-medium whitespace-nowrap">Mejor: ${bestPrice}</span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="ml-auto btn btn-sm btn-outline gap-2 whitespace-nowrap"
                            disabled={(selectedItem.benchmarks?.length || 0) >= 7}
                        >
                            <Plus className="w-4 h-4" /> Agregar
                        </button>
                    </div>

                    {/* Benchmarks List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {(!selectedItem.benchmarks || selectedItem.benchmarks.length === 0) ? (
                            <div className="text-center py-8 text-[var(--color-text-muted)] text-sm">
                                Sin comparaciones creadas.
                                <br />Agrega hasta 7 precios/ubicaciones.
                            </div>
                        ) : (
                            selectedItem.benchmarks.map(bm => (
                                <div key={bm.id} className="group flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors border border-transparent hover:border-[var(--color-border)]">
                                    {/* Thumbnail if exists */}
                                    {bm.imageUrl ? (
                                        <img src={bm.imageUrl} alt={bm.storeName} className="w-10 h-10 rounded object-cover bg-black/20" />
                                    ) : (
                                        <div className={`w-10 h-10 rounded flex items-center justify-center ${bm.type === 'online' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                            {bm.type === 'online' ? <Globe className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm truncate">{bm.storeName}</p>
                                            {/* Type badge */}
                                            <span className={`text-[10px] px-1.5 rounded-full ${bm.type === 'online' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                {bm.type === 'online' ? 'Online' : 'Física'}
                                            </span>
                                        </div>
                                        {bm.url && (
                                            <a href={bm.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1 w-fit">
                                                Link <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold font-mono ${bm.price === bestPrice ? 'text-green-500' : ''}`}>
                                            ${bm.price}
                                        </span>
                                        <button
                                            onClick={() => removeBenchmark(bm.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-500 rounded transition-all"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Add Benchmark Modal/Overlay */}
            {isAdding && (
                <div className="absolute inset-0 z-20 bg-[var(--color-bg)]/95 backdrop-blur-md p-4 flex flex-col animate-in fade-in duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold">Nueva Comparación</h4>
                        <button onClick={() => setIsAdding(false)} className="btn btn-ghost btn-sm btn-square">✕</button>
                    </div>

                    <form onSubmit={handleAddBenchmark} className="space-y-4 flex-1 overflow-y-auto">
                        {/* Store & Type */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-[var(--color-text-muted)] block mb-1">Tienda / Lugar</label>
                                <input
                                    autoFocus
                                    type="text"
                                    required
                                    className="input-field w-full"
                                    placeholder="Ej: Amazon"
                                    value={newBenchmark.storeName || ''}
                                    onChange={e => setNewBenchmark({ ...newBenchmark, storeName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-[var(--color-text-muted)] block mb-1">Tipo de Tienda</label>
                                <select
                                    className="input-field w-full"
                                    value={newBenchmark.type}
                                    onChange={e => setNewBenchmark({ ...newBenchmark, type: e.target.value as any })}
                                >
                                    <option value="online">Online</option>
                                    <option value="physical">Física</option>
                                </select>
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="text-xs text-[var(--color-text-muted)] block mb-1">Precio Encontrado</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                className="input-field w-full font-mono"
                                placeholder="0.00"
                                value={newBenchmark.price || ''}
                                onChange={e => setNewBenchmark({ ...newBenchmark, price: Number(e.target.value) })}
                            />
                        </div>

                        {/* Image Selection */}
                        <div className="p-3 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
                            <label className="text-xs font-semibold block mb-2">Evidencia (Foto/Screenshot)</label>

                            <div className="flex gap-2 mb-3">
                                <button
                                    type="button"
                                    onClick={() => setImageSource('url')}
                                    className={`flex-1 text-xs py-1.5 px-2 rounded transition-colors ${imageSource === 'url' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]'}`}
                                >
                                    URL de Imagen
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageSource('file')}
                                    className={`flex-1 text-xs py-1.5 px-2 rounded transition-colors ${imageSource === 'file' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]'}`}
                                >
                                    Subir Archivo
                                </button>
                            </div>

                            {imageSource === 'url' ? (
                                <input
                                    type="url"
                                    className="input-field w-full"
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    value={newBenchmark.imageUrl || ''}
                                    onChange={e => setNewBenchmark({ ...newBenchmark, imageUrl: e.target.value })}
                                />
                            ) : (
                                <div className="space-y-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        className="text-xs w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-primary)]/10 file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)]/20 cursor-pointer"
                                    />
                                    {selectedFile && (
                                        <p className="text-[10px] text-green-500 truncate">
                                            Seleccionado: {selectedFile.name}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Link */}
                        <div>
                            <label className="text-xs text-[var(--color-text-muted)] block mb-1">Enlace Directo (Opcional)</label>
                            <div className="relative">
                                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                                <input
                                    type="url"
                                    className="input-field w-full pl-9"
                                    placeholder="https://"
                                    value={newBenchmark.url || ''}
                                    onChange={e => setNewBenchmark({ ...newBenchmark, url: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full btn btn-primary flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Subiendo...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        Agregar Comparación
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
