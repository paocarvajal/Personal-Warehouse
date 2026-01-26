import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { ArrowLeft, Edit, MapPin, Tag, Calendar, Package } from 'lucide-react';

export const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { items, boxes } = useInventory();
    const navigate = useNavigate();

    const item = items.find(i => i.id === id);

    const [isZoomed, setIsZoomed] = useState(false);

    if (!item) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <p className="text-gray-500 text-lg mb-4">Artículo no encontrado</p>
                <button onClick={() => navigate(-1)} className="btn btn-primary px-6 py-2">Volver</button>
            </div>
        );
    }

    const box = boxes.find(b => b.id === item.boxId);

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            {/* ZOOM MODAL */}
            {isZoomed && item.imageUrl && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsZoomed(false)}
                >
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    />
                    <div className="absolute top-4 right-4 text-white/50 text-sm">Click para cerrar</div>
                </div>
            )}

            {/* NAV */}
            <button
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Volver
            </button>

            <div className="bg-[var(--bg-secondary)] rounded-3xl overflow-hidden shadow-2xl border border-white/5 flex flex-col md:flex-row">

                {/* IMAGE SECTION */}
                <div className="w-full md:w-1/2 bg-black/40 relative min-h-[300px] group cursor-zoom-in" onClick={() => item.imageUrl && setIsZoomed(true)}>
                    {item.imageUrl ? (
                        <>
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                <span className="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">Ver Foto</span>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 p-12">
                            <Package size={64} className="mb-4 opacity-50" />
                            <span className="text-sm font-medium">Sin imagen</span>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] md:bg-gradient-to-r md:from-transparent md:to-[var(--bg-secondary)] opacity-50 pointer-events-none"></div>
                </div>

                {/* DETAILS SECTION */}
                <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col relative">
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                            <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
                                {item.category}
                            </span>
                            <button
                                onClick={() => navigate(`/edit/${item.id}`)}
                                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                                title="Editar"
                            >
                                <Edit size={20} />
                            </button>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">{item.name}</h1>

                        {item.description && (
                            <p className="text-gray-400 text-sm leading-relaxed mb-8 border-l-2 border-purple-500/30 pl-4 italic">
                                {item.description}
                            </p>
                        )}

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-bold">Cantidad</div>
                                    <div className="text-xl font-mono font-bold text-white">{item.quantity} unidades</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-bold">Ubicación</div>
                                    <div className="text-lg font-medium text-white">
                                        {box ? (
                                            <span onClick={() => navigate(`/boxes/${box.id}`)} className="hover:text-[var(--accent-purple)] cursor-pointer hover:underline">
                                                📦 {box.name} ({box.location})
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic">Sin asignar (Suelto)</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {item.tags && item.tags.length > 0 && (
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
                                        <Tag size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">Tags</div>
                                        <div className="flex flex-wrap gap-2">
                                            {item.tags.map(tag => (
                                                <span key={tag} className="text-xs bg-black/30 px-2 py-1 rounded text-gray-300 border border-white/5">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            Agregado: {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                        <div className="font-mono opacity-50">ID: {item.id.slice(0, 8)}...</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
