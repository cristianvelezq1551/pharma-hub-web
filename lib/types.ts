// Tipos TypeScript del ecommerce — equivalente a los modelos de Dart en Flutter

export type UserRole = 'ADMIN' | 'SELLER' | 'CUSTOMER';
export type OrderStatus = 'PENDING' | 'APPROVED' | 'DISPATCHED' | 'DELIVERED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthUser extends User {
  wallet?: { balance: number };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  discount: number;
  stock: number;
  imageUrl?: string;
  isAvailable: boolean;
  requiresCertificate: boolean;
  categoryId: string;
  category: Category;
}

export interface CartItem {
  id: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  totalSaved: number;
  total: number;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: Product;
}

export interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: OrderItem[];
  adminNote?: string;
}

export interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  balance: number;
  transactions: WalletTransaction[];
}

export interface ApiError {
  message: string | string[];
  statusCode: number;
}
