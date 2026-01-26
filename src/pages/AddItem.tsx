import { useState, useRef } from 'react';
import { useInventory } from '../context/InventoryContext';
import type { Category } from '../types';
import { useNavigate } from 'react-router-dom';
import { Camera, Save, ChevronLeft, Loader2 } from 'lucide-react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CATEGORIES: Category[] = [
    'Carpintería', 'Plomería', 'Electricidad', 'Jardinería', 'Pintura', 'Automotriz', 'Varios'
];

export const AddItem = () => {
    const { addItem, boxes } = useInventory();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        quantity: 1,
        category: '' as Category,
        description: '',
        boxId: '',
        tags: '',
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            addLog(`Selected file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                addLog("Preview generated");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        addLog("Starting submit...");

        try {
            let finalImageUrl = undefined;

            if (imageFile) {
                addLog(`Attempting upload of: ${imageFile.name}`);
                // User wants to upload an image
                try {
                    const storageRef = ref(storage, `items/${Date.now()}_${imageFile.name}`);

                    // Create a race between the full task and a 30s timeout
                    const timeoutPromise = new Promise<string>((_, reject) =>
                        setTimeout(() => reject(new Error("Tiempo de espera agotado (30s)")), 30000)
                    );

                    const performUpload = async () => {
                        addLog("Starting uploadBytes...");
                        const snapshot = await uploadBytes(storageRef, imageFile);
                        addLog("UploadBytes finished. Getting URL...");
                        return await getDownloadURL(snapshot.ref);
                    };

                    finalImageUrl = await Promise.race([performUpload(), timeoutPromise]);
                    addLog("Upload Success! Got URL.");

                } catch (err: any) {
                    addLog(`ERROR CATCH: ${err.message}`);
                    console.error("Upload error:", err);

                    let errorMsg = "Error desconocido al subir imagen.";
                    if (err.code === 'storage/unauthorized') errorMsg = "Permiso denegado en Storage.";
                    if (err.message) errorMsg = err.message;

                    // Ask user how to proceed
                    if (confirm(`Falló la subida de imagen: ${errorMsg}\n\n¿Quieres guardar el artículo SIN imagen?`)) {
                        finalImageUrl = undefined;
                    } else {
                        setUploading(false);
                        return; // Cancel save
                    }
                }
            } else if (imagePreview && imagePreview.startsWith('http')) {
                // If it's an existing URL (not base64), keep it (logic for future edit mode, unlikely here but safe)
                finalImageUrl = imagePreview;
            }

            await addItem({
                name: formData.name,
                quantity: Number(formData.quantity),
                category: formData.category,
                description: formData.description,
                boxId: formData.boxId || null,
                imageUrl: finalImageUrl || null,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            });
            navigate('/');
        } catch (error) {
            console.error("Error saving item:", error);
            alert("Error al guardar el item en la base de datos.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            {/* ZOOM MODAL */}
            {isZoomed && imagePreview && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsZoomed(false)}
                >
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    />
                    <div className="absolute top-4 right-4 text-white/50 text-sm">Click para cerrar</div>
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Cancelar
                </button>
                <div>
                    <span className="text-purple-400 font-bold uppercase tracking-wider text-xs">Nuevo Registro</span>
                    <h1 className="text-3xl font-bold text-white mt-1">Agregar Artículo</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Primary Info Card */}
                <div className="bg-[#242938] p-6 rounded-2xl border border-gray-700 shadow-xl">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-400 font-bold text-sm uppercase mb-2">Nombre del Artículo</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-[#1A1D29] border border-gray-700 rounded-xl p-4 text-white text-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-gray-600"
                                placeholder="Ej. Taladro Inalámbrico 20V"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-400 font-bold text-sm uppercase mb-2">Categoría</label>
                                <div className="relative">
                                    <input
                                        list="category-list"
                                        type="text"
                                        className="w-full bg-[#1A1D29] border border-gray-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all placeholder-gray-600"
                                        placeholder="Escribe o selecciona..."
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        onFocus={(e) => e.target.select()}
                                    />
                                    <datalist id="category-list">
                                        {CATEGORIES.map(cat => <option key={cat} value={cat} />)}
                                    </datalist>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4 fill-current opacity-50" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-400 font-bold text-sm uppercase mb-2">Cantidad</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full bg-[#1A1D29] border border-gray-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Card */}
                <div className="bg-[#242938] p-6 rounded-2xl border border-gray-700 shadow-xl">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-400 font-bold text-sm uppercase mb-2">Fotografía</label>
                            <div
                                className="w-full bg-[#1A1D29] border-2 border-dashed border-gray-700 hover:border-purple-500 hover:bg-gray-800 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group min-h-[200px]"
                                onClick={() => {
                                    if (imagePreview) {
                                        setIsZoomed(true);
                                    } else {
                                        fileInputRef.current?.click();
                                    }
                                }}
                            >
                                {imagePreview ? (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <img
                                            src={imagePreview}
                                            className="max-h-[180px] object-contain rounded-lg"
                                            alt="Preview"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-2">
                                            <button
                                                type="button"
                                                className="bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md hover:bg-black/80 transition-colors pointer-events-auto"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    fileInputRef.current?.click();
                                                }}
                                            >
                                                Cambiar Foto
                                            </button>
                                        </div>
                                        <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white/70 pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-4 bg-gray-800 rounded-full mb-3 group-hover:bg-purple-500/20 transition-colors">
                                            <Camera size={24} className="text-gray-400 group-hover:text-purple-400" />
                                        </div>
                                        <span className="text-gray-400 font-medium group-hover:text-white transition-colors">
                                            Toca para subir foto
                                        </span>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 font-bold text-sm uppercase mb-2">Ubicación (Caja)</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-[#1A1D29] border border-gray-700 rounded-xl p-4 text-white appearance-none focus:border-purple-500 outline-none transition-all cursor-pointer"
                                    value={formData.boxId}
                                    onChange={e => setFormData({ ...formData, boxId: e.target.value })}
                                >
                                    <option value="">-- Sin asignar (Suelto) --</option>
                                    {boxes.map(box => (
                                        <option key={box.id} value={box.id}>📦 {box.name} ({box.location})</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                * Puedes asignar una caja más tarde escaneando su QR.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={uploading}
                    className="w-full btn btn-primary py-4 rounded-xl font-bold text-lg shadow-lg shadow-purple-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            Guardar en Inventario
                        </>
                    )}
                </button>

                {/* DEBUG LOGS */}
                <div className="mt-8 p-4 bg-black/50 rounded-xl text-xs font-mono text-green-400 overflow-auto max-h-40">
                    <p className="font-bold text-white mb-2">Debug Log (Take a screenshot if stuck):</p>
                    {logs.map((log, i) => (
                        <div key={i}>{log}</div>
                    ))}
                </div>
            </form>
        </div>
    );
};
