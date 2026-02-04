import {API} from "../config/axios"
import type {StockEntry, StockExit } from "../types/Movement"
import  type { Product } from "../types/Product"

export const Products = {
    getAll : () => API.get<Product[]>('/products'),
    getById: (id: number) => API.get<Product>(`/products/${id}`),
    create: (product: Omit<Product, 'id'>) => API.post<Product>('/products', product),
    update: (id: number, product: Partial<Product>) => API.patch<Product>(`products/${id}`, product),
    delete: (id: number) => API.delete(`products/${id}`)
}

export const StockEntries = {
    getAll : () => API.get<StockEntry[]>('/stock/entry'),
    getById: (id: number) => API.get<StockEntry>(`/stock/entry/${id}`),
    create: (stockEntry: Omit<StockEntry, 'id'>) => API.post<StockEntry>('/stock/entry', stockEntry),
    delete: (id: number) => API.delete(`stock/entry/${id}`)
}

export const StockExits = {
    getAll : () => API.get<StockExit[]>('/stock/exit'),
    getById: (id: number) => API.get<StockExit>(`/stock/exit/${id}`),
    create: (stockExit: Omit<StockExit, 'id'>) => API.post<StockExit>('/stock/exit', stockExit),
    delete: (id: number) => API.delete(`stock/exit/${id}`)
}