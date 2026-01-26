import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { InventoryProvider } from './context/InventoryContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import { Inventory } from './pages/Inventory';
import { Benchmarking } from './pages/Benchmarking';
import { AddItem } from './pages/AddItem';
import { EditItem } from './pages/EditItem';
import ProductDetail from './pages/ProductDetail';
import { BoxList } from './pages/BoxList';
import { BoxDetails } from './pages/BoxDetails';
import { Scan } from './pages/Scan';
import { Login } from './pages/Login';
import { Loader2 } from 'lucide-react';

import { type ReactNode } from 'react';

// Component to protect routes
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#1A1D29] text-white">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <Router basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Home />} />
              <Route path="benchmarking" element={<Benchmarking />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="add" element={<AddItem />} />
              <Route path="edit/:id" element={<EditItem />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="boxes" element={<BoxList />} />
              <Route path="boxes/:id" element={<BoxDetails />} />
              <Route path="scan" element={<Scan />} />
            </Route>
          </Routes>
        </Router>
      </InventoryProvider >
    </AuthProvider>
  );
}

export default App;
