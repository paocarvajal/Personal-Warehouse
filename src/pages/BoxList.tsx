import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Box as BoxIcon, Plus, MapPin, Printer } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Link, useNavigate } from 'react-router-dom';

export const BoxList = () => {
    const { boxes, addBox, deleteBox } = useInventory();
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);
    const [newBoxData, setNewBoxData] = useState({ name: '', location: '', description: '' });
    const [selectedBoxIds, setSelectedBoxIds] = useState<string[]>([]);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        addBox(newBoxData);
        setIsCreating(false);
        setNewBoxData({ name: '', location: '', description: '' });
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
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="btn btn-primary px-6 py-3 rounded-xl font-bold custom-shadow hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        <Plus size={20} /> Nueva Caja
                    </button>
                )}
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

            {/* Selection Toolbar */}
            {selectedBoxIds.length > 0 && (
                <div className="mb-6 bg-purple-600/10 border border-purple-500/20 p-4 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
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

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                {boxes.length === 0 && !isCreating ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center text-gray-500 bg-[#242938] rounded-3xl border border-dashed border-gray-700">
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
                    boxes.map(box => (
                        <div
                            key={box.id}
                            className={`group bg-[#242938] border rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col h-full relative overflow-hidden ${selectedBoxIds.includes(box.id) ? 'border-purple-500 shadow-purple-500/20' : 'border-gray-700 hover:border-purple-500/50'}`}
                        >
                            {/* Selection Checkbox */}
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

                            {/* Decorative background accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-600/10 transition-colors pointer-events-none"></div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
