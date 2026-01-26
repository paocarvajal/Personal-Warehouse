import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { AlertTriangle, Package, Search, ChevronLeft, QrCode } from 'lucide-react';

export const Scan = () => {
    const navigate = useNavigate();
    const { boxes } = useInventory();
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState('');

    const handleScanSuccess = (decodedText: string) => {
        setScanResult(decodedText);
        const box = boxes.find(b => b.id === decodedText || b.qrCode === decodedText);
        if (box) {
            navigate(`/boxes/${box.id}`);
        }
    };

    useEffect(() => {
        const scannerId = "reader";
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        const scanner = new Html5QrcodeScanner(scannerId, config, false);

        scanner.render((decodedText) => {
            scanner.clear();
            handleScanSuccess(decodedText);
        }, (errorMessage) => {
            // This callback is called for scanning errors (e.g. alignment), but also startup errors.
            // Check if it's a permission/secure context issue
            if (errorMessage?.includes("NotAllowedError") || errorMessage?.includes("Permission")) {
                console.error("Camera permission denied:", errorMessage);
                // We could show a UI error here, but standard behavior usually logs it.
                // Ideally we'd set a state to show a "Camera Unavailable" message.
            }
        });

        // Handle specific startup failures if possible, or just rely on the UI to show blank
        // Unfortuantely html5-qrcode's scanner.render doesn't return a promise. 
        // We'll rely on the manual input fallback if it fails.

        return () => {
            scanner.clear().catch(err => console.error("Failed to clear scanner", err));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    const handleManualSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualCode.trim()) {
            handleScanSuccess(manualCode);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* Header */}
            <div className="page-header">
                <div>
                    <button onClick={() => navigate(-1)} className="btn-ghost" style={{ paddingLeft: 0, marginBottom: '8px' }}>
                        <ChevronLeft size={20} /> Volver
                    </button>
                    <div className="page-title-group">
                        <div className="greeting">Escáner</div>
                        <h1>Lectura de Etiqueta</h1>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Scanner Card */}
                <div className="balance-card" style={{ padding: 0, overflow: 'hidden', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', border: '2px solid var(--accent-teal)' }}>
                    {!scanResult ? (
                        <div id="reader" style={{ width: '100%', height: '100%' }}></div>
                    ) : (
                        <div style={{ padding: '32px', textAlign: 'center', width: '100%', height: '100%', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                            <div className="icon-circle purple">
                                <Package size={32} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Código Detectado</h2>
                                <div style={{ background: 'var(--bg-primary)', padding: '8px 16px', borderRadius: '8px', marginTop: '8px', fontFamily: 'monospace', color: 'var(--accent-teal)', border: '1px solid var(--bg-tertiary)' }}>
                                    {scanResult}
                                </div>
                            </div>

                            <div style={{ background: 'rgba(255, 107, 107, 0.1)', border: '1px solid var(--color-error)', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', color: 'var(--color-error)', display: 'flex', gap: '8px', alignItems: 'center', textAlign: 'left' }}>
                                <AlertTriangle size={20} />
                                <p>Este código no está registrado como una Caja conocida.</p>
                            </div>

                            <div style={{ display: 'grid', gap: '12px', width: '100%' }}>
                                <button onClick={() => navigate(`/add?boxId=${scanResult}`)} className="btn btn-primary" style={{ width: '100%' }}>
                                    Crear Caja con este QR
                                </button>
                                <button onClick={() => window.location.reload()} className="btn btn-ghost" style={{ width: '100%' }}>
                                    Escanear Otro
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Manual Input */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>— O ingreso manual —</p>
                    <form onSubmit={handleManualSearch} style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <QrCode size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder="Escribe el ID de la caja..."
                                className="input-primary"
                                style={{ paddingLeft: '48px' }}
                                value={manualCode}
                                onChange={e => setManualCode(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-icon">
                            <Search size={24} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
