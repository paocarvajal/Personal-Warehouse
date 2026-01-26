import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard } from 'lucide-react';

export const Login = () => {
    const { signInWithGoogle, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
            <div className="bg-[var(--bg-secondary)] p-8 rounded-3xl shadow-2xl border border-white/5 max-w-md w-full text-center space-y-8 animate-in zoom-in duration-500">

                <div className="flex justify-center">
                    <div className="bg-gradient-to-tr from-purple-500 to-blue-500 p-6 rounded-2xl shadow-lg shadow-purple-500/20">
                        <LayoutDashboard size={48} className="text-white" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white">Bienvenido</h1>
                    <p className="text-gray-400">Personal Warehouse Manager</p>
                </div>

                <button
                    onClick={signInWithGoogle}
                    className="w-full bg-white text-gray-900 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-95 group"
                >
                    <img
                        src="https://www.google.com/favicon.ico"
                        alt="Google"
                        className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all"
                    />
                    <span>Iniciar sesión con Google</span>
                </button>

                <p className="text-xs text-gray-600">
                    Acceso exclusivo para administradores autorizados.
                </p>
            </div>
        </div>
    );
};
