import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Item, Box, BenchmarkItem } from '../types';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import {
    collection,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    type QuerySnapshot,
    type DocumentData
} from 'firebase/firestore';

interface InventoryContextType {
    items: Item[];
    boxes: Box[];
    benchmarks: BenchmarkItem[];
    addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    addBox: (box: Omit<Box, 'id' | 'createdAt' | 'qrCode'>) => Promise<void>;
    deleteBox: (id: string) => Promise<void>;
    addBenchmark: (bm: Omit<BenchmarkItem, 'id' | 'createdAt'>) => Promise<void>;
    updateBenchmark: (id: string, updates: Partial<BenchmarkItem>) => Promise<void>;
    deleteBenchmark: (id: string) => Promise<void>;
    getBoxContents: (boxId: string) => Item[];
    loading: boolean;
    error: string | null;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [boxes, setBoxes] = useState<Box[]>([]);
    const [benchmarks, setBenchmarks] = useState<BenchmarkItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Subscribe to Items
    useEffect(() => {
        if (!user) {
            setItems([]);
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'users', user.uid, 'items'));
        const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
            const itemsData: Item[] = [];
            querySnapshot.forEach((doc) => {
                itemsData.push({ id: doc.id, ...doc.data() } as Item);
            });
            // Optional: Sort in client or use orderBy in query if index exists
            setItems(itemsData.sort((a, b) => b.createdAt - a.createdAt));
            setLoading(false);
        }, (err: Error) => {
            console.error("Error fetching items:", err);
            setError("Error cargando inventario. Revisa tu configuración de Firebase.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Subscribe to Boxes
    useEffect(() => {
        if (!user) {
            setBoxes([]);
            return;
        }

        const q = query(collection(db, 'users', user.uid, 'boxes'));
        const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
            const boxesData: Box[] = [];
            querySnapshot.forEach((doc) => {
                boxesData.push({ id: doc.id, ...doc.data() } as Box);
            });
            setBoxes(boxesData);
        }, (err: Error) => {
            console.error("Error fetching boxes:", err);
        });

        return () => unsubscribe();
    }, [user]);

    // Subscribe to Benchmarks
    useEffect(() => {
        if (!user) {
            setBenchmarks([]);
            return;
        }

        const q = query(collection(db, 'users', user.uid, 'benchmarks'));
        const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
            const bmData: BenchmarkItem[] = [];
            querySnapshot.forEach((doc) => {
                bmData.push({ id: doc.id, ...doc.data() } as BenchmarkItem);
            });
            setBenchmarks(bmData.sort((a, b) => b.createdAt - a.createdAt));
        }, (err: Error) => { console.error("Error fetching benchmarks:", err); });
        return () => unsubscribe();
    }, [user]);

    const addItem = async (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            if (!user) throw new Error("User not authenticated");
            // Explicitly map fields to avoid undefined values. Use null for optional fields.
            const docData = {
                name: itemData.name,
                sku: itemData.sku || null,
                quantity: itemData.quantity,
                unit: itemData.unit || 'pcs',
                category: itemData.category,
                description: itemData.description || '',
                boxId: itemData.boxId || null,
                imageUrl: itemData.imageUrl || null,
                tags: itemData.tags || [],
                benchmarks: itemData.benchmarks || [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            await addDoc(collection(db, 'users', user.uid, 'items'), docData);
        } catch (e) {
            console.error("Error adding item: ", e);
            throw e;
        }
    };

    const updateItem = async (id: string, updates: Partial<Item>) => {
        try {
            if (!user) throw new Error("User not authenticated");
            const itemRef = doc(db, 'users', user.uid, 'items', id);

            // Remove undefined fields to prevent Firestore errors
            const cleanUpdates = Object.fromEntries(
                Object.entries(updates).filter(([_, v]) => v !== undefined)
            );

            await updateDoc(itemRef, {
                ...cleanUpdates,
                updatedAt: Date.now()
            });
        } catch (e) {
            console.error("Error updating item: ", e);
            throw e;
        }
    };

    const deleteItem = async (id: string) => {
        try {
            if (!user) throw new Error("User not authenticated");
            await deleteDoc(doc(db, 'users', user.uid, 'items', id));
        } catch (e) {
            console.error("Error deleting item: ", e);
            throw e;
        }
    };

    const addBenchmark = async (bmData: Omit<BenchmarkItem, 'id' | 'createdAt'>) => {
        try {
            if (!user) throw new Error("User not authenticated");
            await addDoc(collection(db, 'users', user.uid, 'benchmarks'), {
                ...bmData,
                createdAt: Date.now(),
                options: bmData.options || []
            });
        } catch (e) { console.error("Error adding benchmark: ", e); throw e; }
    };

    const updateBenchmark = async (id: string, updates: Partial<BenchmarkItem>) => {
        try {
            if (!user) throw new Error("User not authenticated");
            const bmRef = doc(db, 'users', user.uid, 'benchmarks', id);
            // Remove undefined fields to prevent Firestore errors
            const cleanUpdates = Object.fromEntries(
                Object.entries(updates).filter(([_, v]) => v !== undefined)
            );
            await updateDoc(bmRef, cleanUpdates);
        } catch (e) { console.error("Error updating benchmark: ", e); throw e; }
    };

    const deleteBenchmark = async (id: string) => {
        try { 
            if (!user) throw new Error("User not authenticated");
            await deleteDoc(doc(db, 'users', user.uid, 'benchmarks', id)); 
        }
        catch (e) { console.error("Error deleting benchmark: ", e); throw e; }
    };

    const addBox = async (boxData: Omit<Box, 'id' | 'createdAt' | 'qrCode'>) => {
        try {
            if (!user) throw new Error("User not authenticated");
            // Create a reference with an auto-generated ID
            const newBoxRef = doc(collection(db, 'users', user.uid, 'boxes'));
            const boxId = newBoxRef.id;

            // Define the box object
            const newBox: Omit<Box, 'id'> = {
                ...boxData,
                qrCode: boxId, // Storing just the ID as the QR code for simplicity, or keep 'BOX:${boxId}' if preferred
                createdAt: Date.now(),
            };

            // Save to Firestore
            await setDoc(newBoxRef, newBox);
        } catch (e) {
            console.error("Error adding box: ", e);
            throw e;
        }
    };




    const deleteBox = async (id: string) => {
        try {
            if (!user) throw new Error("User not authenticated");
            await deleteDoc(doc(db, 'users', user.uid, 'boxes', id));
            // Optional: Remove boxId from items in this box? 
            // For now, let's leave them "orphaned" or handle logic elsewhere
        } catch (e) {
            console.error("Error deleting box: ", e);
            throw e;
        }
    };

    const getBoxContents = (boxId: string) => {
        return items.filter(item => item.boxId === boxId);
    };

    return (
        <InventoryContext.Provider value={{
            items, boxes, benchmarks, addItem, updateItem, deleteItem, addBox, deleteBox,
            addBenchmark, updateBenchmark, deleteBenchmark,
            getBoxContents, loading, error
        }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
};
