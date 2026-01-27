import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Database, AlertCircle, CheckCircle, Upload, Loader2 } from 'lucide-react';
import type { Category } from '../types';

export const BulkImport = () => {
    const { addItem, boxes } = useInventory();
    const navigate = useNavigate();
    const [rawText, setRawText] = useState('');
    const [parsedItems, setParsedItems] = useState<any[]>([]);
    const [importing, setImporting] = useState(false);
    const [step, setStep] = useState<'input' | 'preview'>('input');

    const generateSKU = (category: string) => {
        if (!category) return '';
        const prefix = category.substring(0, 3).toUpperCase();
        const randomNum = Math.floor(1000000 + Math.random() * 9000000);
        return `${prefix}-${randomNum}`;
    };

    const handleParse = () => {
        if (!rawText.trim()) return;

        const lines = rawText.split('\n').filter(line => line.trim());
        const parsed = lines.map((line, index) => {
            // Split by tab (Excel paste) or pipe or comma
            const parts = line.split(/\t|\|/).map(s => s.trim());

            // Format: Name | Category | Quantity | Unit | Description | Box Name (Location)
            const name = parts[0] || '';
            const category = (parts[1] || 'Varios') as Category;
            const quantity = parseInt(parts[2] || '1') || 1;
            const unit = parts[3] || 'pza';
            const description = parts[4] || '';
            const locationName = parts[5] || '';

            // Try to find box ID
            const box = boxes.find(b =>
                b.name.toLowerCase() === locationName.toLowerCase() ||
                b.location.toLowerCase() === locationName.toLowerCase()
            );

            return {
                id: index,
                name,
                category,
                quantity,
                unit,
                description,
                boxName: locationName,
                boxId: box?.id || null, // Will range later if not found
                sku: generateSKU(category),
                isValid: name.length > 0 && category.length > 0
            };
        });

        setParsedItems(parsed);
        setStep('preview');
    };

    const handleImport = async () => {
        setImporting(true);
        try {
            const validItems = parsedItems.filter(i => i.isValid);

            // Execute all adds
            await Promise.all(validItems.map(item => addItem({
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                category: item.category,
                description: item.description,
                sku: item.sku,
                boxId: item.boxId,
                tags: ['importado'], // Tag them so we know
            })));

            alert(`✅ ${validItems.length} artículos importados exitosamente!`);
            navigate('/boxes');
        } catch (e) {
            console.error(e);
            alert("Hubo un error al importar algunos artículos. Revisa la consola.");
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Volver
                </button>
                <div>
                    <span className="text-purple-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                        <Database size={14} /> Importación Masiva
                    </span>
                    <h1 className="text-3xl font-bold text-white mt-1">Carga Rápida de Inventario</h1>
                </div>
            </div>

            {step === 'input' && (
                <div className="space-y-6 animate-in slide-in-from-left-4">
                    <div className="bg-[#242938] p-6 rounded-2xl border border-gray-700 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-2">Instrucciones</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Copia y pega tus datos desde Excel o Google Sheets. El formato esperado es:
                            <br />
                            <code className="bg-black/30 px-2 py-1 rounded text-purple-300 block mt-2">
                                Nombre  [TAB]  Categoría  [TAB]  Cantidad  [TAB]  Unidad  [TAB]  Descripción (Opc)  [TAB]  Nombre de Caja (Opc)
                            </code>
                        </p>

                        <textarea
                            className="w-full bg-[#1A1D29] border border-gray-700 rounded-xl p-4 text-white font-mono text-sm focus:border-purple-500 outline-none transition-all h-64 whitespace-pre"
                            placeholder={"Taladro Makita\tHerramientas\t1\tpcs\tModelo 2020\tCaja Roja\nCinta Métrica\tHerramientas\t2\tm\t5 metros\tCaja Azul"}
                            value={rawText}
                            onChange={e => setRawText(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleParse}
                        disabled={!rawText.trim()}
                        className="w-full btn btn-primary py-4 rounded-xl font-bold text-lg shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Revisar Datos
                    </button>
                </div>
            )}

            {step === 'preview' && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="bg-[#242938] rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-gray-700 bg-[#2d3241]/50 flex justify-between items-center">
                            <h3 className="font-bold text-white">Vista Previa ({parsedItems.length} ítems)</h3>
                            <button onClick={() => setStep('input')} className="text-sm text-gray-400 hover:text-white">Editar entrada</button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#1A1D29] text-gray-400 uppercase text-xs font-bold">
                                    <tr>
                                        <th className="p-4">Estado</th>
                                        <th className="p-4">Nombre</th>
                                        <th className="p-4">Categoría</th>
                                        <th className="p-4 text-center">Cant.</th>
                                        <th className="p-4">Unidad</th>
                                        <th className="p-4">Destino (Caja)</th>
                                        <th className="p-4">SKU Nuevo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {parsedItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                {item.isValid ? (
                                                    <CheckCircle size={18} className="text-emerald-400" />
                                                ) : (
                                                    <AlertCircle size={18} className="text-red-400" />
                                                )}
                                            </td>
                                            <td className={`p-4 font-medium ${item.isValid ? 'text-white' : 'text-red-300'}`}>
                                                {item.name || '(Sin nombre)'}
                                            </td>
                                            <td className="p-4 text-gray-300">{item.category}</td>
                                            <td className="p-4 text-center text-gray-300">{item.quantity}</td>
                                            <td className="p-4 text-center text-gray-300">{item.unit}</td>
                                            <td className="p-4">
                                                {item.boxId ? (
                                                    <span className="text-emerald-400 flex items-center gap-1">
                                                        📦 {item.boxName}
                                                    </span>
                                                ) : item.boxName ? (
                                                    <span className="text-yellow-400 text-xs flex items-center gap-1" title="Caja no encontrada, quedará suelto">
                                                        ⚠️ "{item.boxName}" no existe (Suelto)
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 font-mono text-xs text-purple-400">{item.sku}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setStep('input')}
                            className="flex-1 px-6 py-4 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition-colors"
                        >
                            Atrás
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={importing || parsedItems.filter(i => i.isValid).length === 0}
                            className="flex-[2] btn btn-primary py-4 rounded-xl font-bold text-lg shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {importing ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                            Importar {parsedItems.filter(i => i.isValid).length} Artículos
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
