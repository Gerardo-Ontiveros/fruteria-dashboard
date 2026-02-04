import type { Product } from "./Product";

export interface StockEntry {
  id: number;
  productId?: number;
  productName?: string;
  quantity?: number;
  purchasePrice?: number;
  date: string;
  supplier?: string;
  products?: Product[]; 
  totalQuantity?: number; 
}

export interface StockExit {
  id: number;
  productId?: number;
  productName?: string;
  quantity?: number;
  date: string;
  reason?: string; 
  customer?: string;
  products?: Product[];
  totalQuantity?: number;
}

