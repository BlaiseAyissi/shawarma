export interface User {
  _id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  role: 'customer' | 'admin';
}

export interface Topping {
  _id: string;
  name: string;
  price: number;
  available: boolean;
  category?: string;
  description?: string;
}

export interface SizeVariation {
  size: string;
  name: string;
  price: number;
  available: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  sizeVariations: SizeVariation[];
  category: string;
  image: string;
  images?: string[]; // Array of up to 5 images
  toppings: Topping[];
  available: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedToppings: Topping[];
  size: string;
  sizeName: string;
  sizePrice: number;
  customizations?: string;
}

export interface OrderItem {
  product: string;
  productName: string;
  productPrice: number;
  quantity: number;
  size: string;
  selectedToppings: {
    name: string;
    price: number;
  }[];
  customizations?: string;
  itemTotal: number;
}

export interface Order {
  _id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentMethod: 'stripe' | 'momo' | 'om' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryAddress: {
    street: string;
    city: string;
    postalCode?: string;
    phone: string;
    instructions?: string;
  };
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}