export type Category = string;

export interface BenchmarkOption {
  id: string;
  storeName: string;
  url?: string;
  price: number;
  imageUrl?: string;
  type: 'online' | 'physical';
}

export interface BenchmarkItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  category?: Category;
  options: BenchmarkOption[];
  targetPrice?: number;
  specs?: string[];
  createdAt: number;
}

export interface Box {
  id: string;
  name: string;
  location: string; // e.g., "Estantería A", "Cajón Banco"
  description: string;
  category?: string;
  qrCode: string; // The unique string stored in the QR
  createdAt: number;
}

export interface Benchmark {
  id: string;
  storeName: string;
  url?: string;
  price: number;
  imageUrl?: string;
  type: 'online' | 'physical';
}

export interface Item {
  id: string;
  name: string;
  sku?: string; // Auto-generated SKU
  description: string;
  quantity: number;
  unit?: string; // e.g., 'pcs', 'kg', 'ml', 'g', 'mg (tabletas)'
  category: Category;
  boxId?: string | null; // Optional: item might not be in a box yet
  imageUrl?: string | null; // Data URL or external URL
  tags: string[];
  benchmarks?: Benchmark[];
  estimatedValue?: number; // Added for Total Value calculation
  createdAt: number;
  updatedAt: number;
}

export type InventoryAction =
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'UPDATE_ITEM'; payload: Item }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'ADD_BOX'; payload: Box }
  | { type: 'UPDATE_BOX'; payload: Box }
  | { type: 'DELETE_BOX'; payload: string }
  | { type: 'MOVE_ITEM'; payload: { itemId: string; boxId: string | undefined } };
