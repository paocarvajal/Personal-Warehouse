import { useInventory } from '../context/InventoryContext';
import { Package, Box, Search, Plus, ScanLine } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Dashboard = () => {
    const { items } = useInventory();
    const navigate = useNavigate();

    const totalItems = items.length;

    // Get recent items (last 5)
    const recentItems = [...items].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

    return (
        <div>
            {/* HEADER */}
            <div className="page-header">
                <div className="page-title-group">
                    <div className="greeting">Hola</div>
                    <h1>Usuario</h1>
                </div>
            </div>

            {/* BALANCE CARD (Summary) */}
            <div className="balance-card">
                <div className="balance-label">Total Artículos</div>
                <div className="balance-amount">{totalItems}</div>
                <span className="balance-change">
                    <span>📦</span>
                    <span>{items.length > 0 ? 'En inventario' : 'Sin items'}</span>
                </span>
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid-actions" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', marginBottom: '32px' }}>
                <div className="grid-card" onClick={() => navigate('/add')} style={{ alignItems: 'center', textAlign: 'center' }}>
                    <div className="icon-circle purple" style={{ marginBottom: '12px' }}>
                        <Plus size={24} />
                    </div>
                    <span style={{ fontWeight: 600 }}>Agregar</span>
                </div>

                <div className="grid-card" onClick={() => navigate('/scan')} style={{ alignItems: 'center', textAlign: 'center' }}>
                    <div className="icon-circle teal" style={{ marginBottom: '12px' }}>
                        <ScanLine size={24} />
                    </div>
                    <span style={{ fontWeight: 600 }}>Escanear</span>
                </div>

                <div className="grid-card" onClick={() => navigate('/inventory')} style={{ alignItems: 'center', textAlign: 'center' }}>
                    <div className="icon-circle purple" style={{ marginBottom: '12px' }}>
                        <Search size={24} />
                    </div>
                    <span style={{ fontWeight: 600 }}>Buscar</span>
                </div>

                <div className="grid-card" onClick={() => navigate('/boxes')} style={{ alignItems: 'center', textAlign: 'center' }}>
                    <div className="icon-circle teal" style={{ marginBottom: '12px' }}>
                        <Box size={24} />
                    </div>
                    <span style={{ fontWeight: 600 }}>Cajas</span>
                </div>
            </div>

            {/* DASHBOARD CONTENT GRID (Desktop: 2 cols, Mobile: 1 col) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

                {/* LEFT COL: RECENT TRANSACTIONS (Full Width) */}
                <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Movimientos Recientes</h2>
                        <Link to="/inventory" className="text-link">Ver todo</Link>
                    </div>

                    <div className="transactions-list">
                        {recentItems.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">
                                    <Package size={32} />
                                </div>
                                <p>No hay movimientos recientes</p>
                            </div>
                        ) : (
                            recentItems.map(item => (
                                <div key={item.id} className="transaction-item" onClick={() => navigate(`/edit/${item.id}`)}>
                                    <div className="transaction-left">
                                        <div className="transaction-icon" style={{
                                            background: item.quantity < 3 ? 'var(--color-error-bg)' : 'var(--accent-teal-light)',
                                            color: item.quantity < 3 ? 'var(--color-error)' : 'var(--accent-teal)'
                                        }}>
                                            <Package size={22} />
                                        </div>
                                        <div className="transaction-info">
                                            <div className="transaction-name">{item.name}</div>
                                            <div className="transaction-category">{item.category}</div>
                                        </div>
                                    </div>
                                    <div className={`transaction-amount ${item.quantity < 3 ? 'negative' : 'positive'}`}>
                                        {item.quantity} un.
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
