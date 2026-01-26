import { useState, useRef } from 'react';
import { useInventory } from '../context/InventoryContext';
import type { Category } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Save, ChevronLeft, Loader2 } from 'lucide-react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CATEGORIES: Category[] = [
    'Carpintería', 'Plomería', 'Electricidad', 'Jardinería', 'Pintura', 'Automotriz', 'Varios'
];

export const AddItem = () => {
    const { addItem, boxes } = useInventory();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        quantity: 1,
        category: '' as Category,
        sku: '',
        description: '',
        boxId: searchParams.get('boxId') || '',
        tags: '',
    });

    const generateSKU = (category: string) => {
        if (!category) return '';
        const prefix = category.substring(0, 3).toUpperCase();
        const randomNum = Math.floor(1000000 + Math.random() * 9000000); // 7 digit random number
        return `${prefix}-${randomNum}`;
    };

    // Update SKU when category changes if SKU is empty or was auto-generated
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const newCategory = e.target.value as Category;
        setFormData(prev => {
            const shouldGenerate = !prev.sku || prev.sku.startsWith(prev.category.substring(0, 3).toUpperCase());
            return {
                ...prev,
                category: newCategory,
                sku: shouldGenerate ? generateSKU(newCategory) : prev.sku
            };
        });
    };
    // ...
    // handleSubmit update:
    // This part of the code was not provided in the instruction, so it's assumed to be outside the scope of the fix.
    // The instruction provided a large block of JSX that seems to be the main content of the form.
    // I will assume the instruction wants to replace the JSX part of the component with the provided block.

    // Placeholder for other state/handlers that might exist before the JSX
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false); // Assuming this state is needed for image zoom

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        let imageUrl = '';

        if (imageFile) {
            try {
                const imageRef = ref(storage, `items/${Date.now()}-${imageFile.name}`);
                const snapshot = await uploadBytes(imageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            } catch (error) {
                console.error("Error uploading image:", error);
                alert("Error al subir la imagen.");
                setUploading(false);
                return;
            }
        }

        try {
            await addItem({
                name: formData.name,
                sku: formData.sku,
                quantity: Number(formData.quantity),
                category: formData.category,
                description: formData.description,
                boxId: formData.boxId || null,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
                imageUrl: imageUrl || null,
            });
            navigate(-1); // Go back to the previous page
        } catch (error) {
            console.error("Error adding item:", error);
            alert("Error al agregar el artículo.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1A1D29] text-white p-6 sm:p-8">
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

            <button
                onClick={() => navigate(-1)}
                className="text-gray-400 hover:text-purple-400 transition-colors flex items-center mb-6"
            >
                <ChevronLeft size={20} className="mr-1" /> Volver
            </button>

            <h1 className="text-3xl font-bold text-white mb-8">Agregar Nuevo Artículo</h1>

            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
                {/* General Info Card */}
                <div className="bg-[#242938] p-6 rounded-2xl border border-gray-700 shadow-xl">
                    <h2 className="text-xl font-semibold text-white mb-6">Información General</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-400 font-bold text-sm uppercase mb-2">Nombre del Artículo</label>
                            <input
                                type="text"
                                className="w-full bg-[#1A1D29] border border-gray-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all"
                                placeholder="Ej: Taladro Inalámbrico"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 font-bold text-sm uppercase mb-2">Categoría</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-[#1A1D29] border border-gray-700 rounded-xl p-4 text-white appearance-none focus:border-purple-500 outline-none transition-all cursor-pointer"
                                    value={formData.category}
                                    onChange={handleCategoryChange}
                                    required
                                >
                                    <option value="" disabled>Selecciona una categoría</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
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
                        <div>
                            <label className="block text-gray-400 font-bold text-sm uppercase mb-2">Descripción (Opcional)</label>
                            <textarea
                                className="w-full bg-[#1A1D29] border border-gray-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all min-h-[100px]"
                                placeholder="Detalles adicionales del artículo..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-gray-400 font-bold text-sm uppercase mb-2">Etiquetas (Separadas por coma)</label>
                            <input
                                type="text"
                                className="w-full bg-[#1A1D29] border border-gray-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all"
                                placeholder="Ej: herramienta, eléctrico, batería"
                                value={formData.tags}
                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Details Card */}
                <div className="bg-[#242938] p-6 rounded-2xl border border-gray-700 shadow-xl">
                    <h2 className="text-xl font-semibold text-white mb-6">Detalles Adicionales</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-400 font-bold text-sm uppercase mb-2">SKU (Auto-generado)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full bg-[#1A1D29] border border-gray-700 rounded-xl p-4 text-white font-mono tracking-wider focus:border-purple-500 outline-none transition-all placeholder-gray-600"
                                    placeholder="AAA-0000000"
                                    value={formData.sku}
                                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                                    <div className="bg-gray-800 text-xs px-2 py-1 rounded text-gray-400">ID Único</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 font-bold text-sm uppercase mb-2">Fotografía</label>
                            <div
                                className="w-full bg-[#1A1D29] border-2 border-dashed border-gray-700 hover:border-purple-500 hover:bg-gray-800 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group min-h-[200px]"
                                onClick={() => {
                                    if (imagePreview) {
                                        setIsZoomed(true); // Assuming setIsZoomed is defined elsewhere
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

            </form>
        </div>
    );
};
