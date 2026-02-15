import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { AlertTriangle, Package, Search, QrCode, Camera } from 'lucide-react';

export const Scan = () => {
    const navigate = useNavigate();
    const { boxes } = useInventory();
    const [permissionError, setPermissionError] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState('');
    const [isScanning, setIsScanning] = useState(true);

    // Use a ref to hold the scanner instance to access it in cleanup
    const scannerRef = useRef<Html5Qrcode | null>(null);

    const handleScanSuccess = (decodedText: string) => {
        // Stop scanning immediately upon success to prevent multiple triggers
        if (scannerRef.current && isScanning) {
            scannerRef.current.pause(true); // Pause the scanner
            setIsScanning(false);
        }

        setScanResult(decodedText);

        // Clean the text (sometimes QRs have hidden characters)
        const cleanText = decodedText.trim();

        console.log("Scanned:", cleanText);

        const box = boxes.find(b =>
            b.id === cleanText ||
            b.qrCode === cleanText ||
            b.name.toLowerCase().includes(cleanText.toLowerCase())
        );

        if (box) {
            // Slight delay to show success UI then navigate
            setTimeout(() => {
                navigate(`/boxes/${box.id}`);
            }, 500);
        }
    };

    useEffect(() => {
        // Initialize scanner
        const scannerId = "reader";

        // Prevent double-init in React Strict Mode
        if (scannerRef.current) return;

        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
        };

        const startScanner = async () => {
            try {
                await html5QrCode.start(
                    { facingMode: "environment" }, // Prefer back camera
                    config,
                    (decodedText) => handleScanSuccess(decodedText),
                    (errorMessage) => {
                        // Ignore frame read errors, they are common while moving camera
                    }
                );
                setIsScanning(true);
            } catch (err: any) {
                console.error("Error starting scanner:", err);
                if (err?.name === "NotAllowedError" || err?.message?.includes("Permission")) {
                    setPermissionError(true);
                }
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop()
                    .then(() => scannerRef.current?.clear())
                    .catch(e => console.error("Failed to stop scanner", e));
                scannerRef.current = null;
            }
        };
        // We only want to run this once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleManualSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualCode.trim()) {
            handleScanSuccess(manualCode);
        }
    };

    const restartScanner = () => {
        window.location.reload();
        // Reloading is the safest way to reset the camera in complex browser states,
        // but we could also implement a soft reset if needed.
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' }}>
            <div className="flex flex-col gap-6 animate-in fade-in">

                {/* Scanner Container */}
                <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/30 bg-black min-h-[400px] shadow-2xl">

                    {/* Error Overlay */}
                    {permissionError && (
                        <div className="absolute inset-0 z-20 bg-[#242938] flex flex-col items-center justify-center p-8 text-center">
                            <AlertTriangle size={48} className="text-red-500 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Acceso a Cámara Denegado</h3>
                            <p className="text-gray-400 mb-6 text-sm">
                                Tu navegador bloqueó el uso de la cámara. Revisa los permisos del sitio.
                            </p>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-yellow-200 text-xs text-left w-full">
                                <p className="font-bold mb-1">💡 ¿Estás en un iPhone/Android?</p>
                                <p>Asegúrate de estar usando HTTPS (la versión publicada en GitHub) y no localhost.</p>
                            </div>
                        </div>
                    )}

                    {/* Scanner Area */}
                    <div id="reader" className="w-full h-full min-h-[400px]"></div>

                    {/* Scanning Overlay (Visual Guides) */}
                    {!scanResult && !permissionError && isScanning && (
                        <div className="absolute inset-0 pointer-events-none z-10">
                            {/* Darken outer area */}
                            <div className="absolute inset-0 border-[50px] border-black/50"></div>

                            {/* Scanning Line Animation */}
                            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse"></div>

                            {/* Corner Markers */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] border-2 border-purple-500 bg-transparent shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-purple-400 -mt-1 -ml-1"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-purple-400 -mt-1 -mr-1"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-purple-400 -mb-1 -ml-1"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-purple-400 -mb-1 -mr-1"></div>
                            </div>

                            <div className="absolute bottom-8 left-0 right-0 text-center">
                                <span className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md">
                                    Enfoca el código QR de la caja
                                </span>
                            </div>
                        </div>
                    )}

                    {/* SUCCESS OVERLAY */}
                    {scanResult && (
                        <div className="absolute inset-0 z-20 bg-[#242938] flex flex-col items-center justify-center p-8 animate-in zoom-in-95 duration-200">
                            <div className="p-4 bg-emerald-500/20 rounded-full mb-4 text-emerald-400">
                                <Package size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">¡Código Detectado!</h2>
                            <div className="bg-black/40 px-6 py-3 rounded-xl border border-gray-700 font-mono text-purple-400 mb-6 text-lg">
                                {scanResult}
                            </div>

                            {/* Actions if not automatically redirected */}
                            <div className="flex flex-col w-full gap-3">
                                <button
                                    onClick={() => restartScanner()}
                                    className="w-full py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors"
                                >
                                    Escanear Nuevo
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Manual Input Section */}
                <div className="text-center">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[#10141d] text-gray-500 uppercase font-bold tracking-wider">O ingreso manual</span>
                        </div>
                    </div>

                    <form onSubmit={handleManualSearch} className="mt-4 flex gap-2">
                        <div className="relative flex-1 group">
                            <QrCode size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Escribe el ID (Ej: BOX:123)..."
                                className="w-full bg-[#242938] border border-gray-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                                value={manualCode}
                                onChange={e => setManualCode(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-xl transition-colors shadow-lg hover:shadow-purple-500/20"
                        >
                            <Search size={24} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
