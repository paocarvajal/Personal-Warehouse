import { useLocation, useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { QRCodeCanvas } from 'qrcode.react';
import { Printer, ArrowLeft } from 'lucide-react';


export const PrintLabels = () => {
    const { state } = useLocation();
    const { boxes } = useInventory();
    const navigate = useNavigate();

    // Get the selected boxes based on IDs passed in navigation state
    const boxIdsToPrint = state?.boxIds || [];
    const selectedBoxes = boxes.filter(b => boxIdsToPrint.includes(b.id));

    const handlePrint = () => {
        window.print();
    };

    if (selectedBoxes.length === 0) {
        return (
            <div className="p-8 text-center text-white">
                <h2>No hay cajas seleccionadas.</h2>
                <button onClick={() => navigate(-1)} className="mt-4 text-blue-400">Volver</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen print:min-h-0 bg-white text-black p-0 m-0">
            {/* No-Print UI Controls */}
            <div className="print:hidden fixed top-0 left-0 right-0 bg-gray-900 p-4 shadow-xl z-50 flex justify-between items-center text-white">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="hover:text-gray-300 flex items-center gap-2">
                        <ArrowLeft size={20} /> Volver
                    </button>
                    <h1 className="font-bold text-lg">
                        Vista Previa: {selectedBoxes.length} Etiqueta{selectedBoxes.length !== 1 ? 's' : ''}
                    </h1>
                </div>
                <button
                    onClick={handlePrint}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all"
                >
                    <Printer size={20} /> Imprimir Ahora
                </button>
            </div>

            {/* Spacer for the fixed header */}
            <div className="print:hidden h-20"></div>

            {/* Printable Grid */}
            <div className="print-grid p-8 print:p-0 gap-4 mx-auto max-w-[21cm]">
                <style>{`
                    .print-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, 5cm);
                        gap: 0.5cm;
                        justify-content: center;
                    }
                    .label-card {
                        width: 5cm;
                        height: 5cm;
                        border: 1px dashed #ccc;
                        padding: 0.2cm;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                        break-inside: avoid;
                        page-break-inside: avoid;
                        overflow: hidden;
                    }
                    @media print {
                        @page {
                            margin: 1cm;
                            size: auto;
                        }
                        html, body {
                            height: auto !important;
                            min-height: 0 !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            background: white;
                        }
                        .print-grid {
                            gap: 0.2cm;
                        }
                        .label-card {
                            border: 1px solid #ddd; /* Lighter border for actual print */
                            break-inside: avoid;
                        }
                    }
                `}</style>

                {selectedBoxes.map(box => (
                    <div key={box.id} className="label-card">
                        <QRCodeCanvas value={box.qrCode} size={110} />
                        <div className="mt-2 w-full overflow-hidden">
                            <h2 className="text-xs font-bold uppercase truncate leading-tight">{box.name}</h2>
                            <p className="text-[10px] text-gray-600 truncate">{box.location}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
