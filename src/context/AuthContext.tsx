import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged, getRedirectResult, type User } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for redirect result (mobile flow)
        getRedirectResult(auth).then((result) => {
            if (result) {
                console.log("Redirect login success", result.user);
            }
        }).catch((error) => {
            console.error("Redirect login error", error);
        });

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error: any) {
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
                // Fallback to redirect if popup fails/is blocked
                try {
                    await signInWithRedirect(auth, googleProvider);
                } catch (redirectError) {
                    console.error("Redirect sign-in failed", redirectError);
                }
            } else {
                console.error("Error signing in with Google", error);
                alert("Error al iniciar sesión con Google. Revisa la consola o intenta de nuevo.");
            }
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
