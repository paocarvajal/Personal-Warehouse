import { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useNavigate, useParams } from 'react-router-dom';
import type { Category } from '../types';
import { Camera, Save, X, Trash2 } from 'lucide-react';

const CATEGORIES: Category[] = [
    'Carpintería', 'Plomería', 'Electricidad', 'Jardinería', 'Pintura', 'Automotriz', 'Varios'
];

export const EditItem = () => {
    const { id } = useParams<{ id: string }>();
    const { items, updateItem, deleteItem, boxes } = useInventory();
    const navigate = useNavigate();

    // Find item
    const item = items.find(i => i.id === id);

    const [formData, setFormData] = useState({
        name: '',
        quantity: 1,
        unit: 'pcs',
        category: '' as Category,
        description: '',
        boxId: '',
        tags: '',
    });

    const getUnits = (category: string) => {
        if (category === 'Medicina' || category === 'Farmacia' || category === 'Salud') {
            return ['pza', 'mg', 'ml', 'tabletas', 'cápsulas', 'inyectable', 'g', 'oz', 'unidades'];
        }
        return ['pza', 'pcs', 'unidades', 'paquete', 'g', 'kg', 'ml', 'l', 'm', 'cm', 'set', 'caja'];
    };

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Load data
    useEffect(() => {
        if (item) {
            // Only update if the item data is different from current form data (basic check)
            // or just rely on 'item' dependency if we assume item only changes when loaded.

            // To be safe and cleaner:
            const newItemData = {
                name: item.name,
                quantity: item.quantity,
                unit: item.unit || 'pcs',
                category: item.category,
                description: item.description || '',
                boxId: item.boxId || '',
                tags: item.tags ? item.tags.join(', ') : '',
            };

            // Simple JSON stringify check to avoid unnecessary updates if item ref changes but content doesn't
            // This is a common pattern when dependencies are unstable objects.
            // eslint-disable-next-line
            setFormData(prev => {
                // Note: keys need to match. formData has keys that match newItemData except 'tags' is string in form.
                // We constructed newItemData to match form structure.

                if (JSON.stringify(prev) !== JSON.stringify(newItemData)) {
                    return newItemData;
                }
                return prev;
            });

            if (item.imageUrl) setImagePreview(item.imageUrl);
        }
    }, [item]);
    //... (handleImageChange remains same)
    const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCategory = e.target.value as Category;
        setFormData(prev => {
            const relevantUnits = getUnits(newCategory);
            const currentUnitValid = relevantUnits.includes(prev.unit);
            return {
                ...prev,
                category: newCategory,
                unit: currentUnitValid ? prev.unit : relevantUnits[0]
            };
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        updateItem(id, {
            name: formData.name,
            quantity: Number(formData.quantity),
            unit: formData.unit,
            category: formData.category,
            description: formData.description,
            boxId: formData.boxId || undefined,
            imageUrl: imagePreview || undefined,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        });
        navigate(-1);
    };

    const handleDelete = () => {
        if (confirm('¿Estás seguro de eliminar este artículo?')) {
            if (id) deleteItem(id);
            navigate(-1);
        }
    };

    if (!item) return <div className="p-8 text-center text-white">Artículo no encontrado.</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-5 duration-500 text-white">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Editar Artículo</h1>
                <button onClick={() => navigate(-1)} className="btn btn-ghost text-gray-400 hover:text-white">
                    <X size={20} /> Cancelar
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info Card */}
                <div className="bg-[#242938] p-6 rounded-2xl border border-gray-700 shadow-xl space-y-6">
                    <div>
                        <label className="block text-gray-400 font-bold text-sm uppercase mb-2">Nombre</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-[#1A1D29] border border-gray-700 rounded-xl p-4 text-white text-lg focus:border-purple-500 outline-none transition-all placeholder-gray-600"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-400 font-bold text-sm uppercase mb-2">Categoría</label>
                            <div className="relative">
                                <input
                                    list="category-list"
                                    type="text"
                                    className="w-full bg-[#1A1D29] border border-gray-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all placeholder-gray-600"
                                    placeholder="Escribe o selecciona..."
                                    value={formData.category}
                                    onChange={handleCategoryChange}
                                    onFocus={(e) => e.target.select()}
                                />
                                <datalist id="category-list">
                                    {CATEGORIES.map(cat => <option key={cat} value={cat} />)}
                                </datalist>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                                    <div className="pointer-events-none opacity-50">▼</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-400 font-bold text-sm uppercase mb-2">Cantidad</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    className="w-24 bg-[#1A1D29] border border-gray-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                />
                                <div className="relative flex-1">
                                    <select
                                        className="w-full bg-[#1A1D29] border border-gray-700 rounded-xl p-4 text-white appearance-none focus:border-purple-500 outline-none transition-all cursor-pointer"
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    >
                                        {getUnits(formData.category).map(u => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                                        <div className="pointer-events-none opacity-50">▼</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 font-bold text-sm uppercase mb-2">Descripción</label>
                        <textarea
                            rows={3}
                            className="w-full bg-[#1A1D29] border border-gray-700 text-white rounded-xl p-4 resize-none focus:border-purple-500 outline-none transition-all"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                {/* Image & Box Card */}
                <div className="bg-[#242938] p-6 rounded-2xl border border-gray-700 shadow-xl space-y-6">
                    <div>
                        <label className="block text-gray-400 font-bold text-sm uppercase mb-2">Ubicación (Caja)</label>
                        <div className="relative">
                            <select
                                className="w-full bg-[#1A1D29] border border-gray-700 rounded-xl p-4 text-white appearance-none focus:border-purple-500 outline-none transition-all cursor-pointer"
                                value={formData.boxId}
                                onChange={e => setFormData({ ...formData, boxId: e.target.value })}
                            >
                                <option value="">-- Suelto / Sin Asignar --</option>
                                {boxes.map(box => (
                                    <option key={box.id} value={box.id}>📦 {box.name} ({box.location})</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 ml-1">
                            Aquí puedes mover el item a una caja recién creada.
                        </p>
                    </div>

                    <div>
                        <label className="block text-gray-400 font-bold text-sm uppercase mb-2">Foto</label>
                        <div className="flex items-center gap-4">
                            {imagePreview && (
                                <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-700 shadow-sm relative group">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <label className="flex-1 btn btn-ghost h-24 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-[#1A1D29] flex flex-col items-center justify-center transition-all group">
                                <Camera size={24} className="text-gray-500 group-hover:text-purple-400 mb-1" />
                                <span className="text-sm text-gray-400 group-hover:text-white">{imagePreview ? 'Cambiar Foto' : 'Agregar Foto'}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>
                    </div>
                </div >

                <div className="flex gap-4 pt-2">
                    <button type="button" onClick={handleDelete} className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20">
                        <Trash2 size={20} /> Eliminar
                    </button>
                    <button type="submit" className="flex-1 btn btn-primary py-4 rounded-xl font-bold text-lg shadow-lg shadow-purple-900/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                        <Save size={20} /> Guardar Cambios
                    </button>
                </div>
            </form >
        </div >
    );
};
