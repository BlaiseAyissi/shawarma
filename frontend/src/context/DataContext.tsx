import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { productsAPI, categoriesAPI, toppingsAPI, ordersAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { syncService } from '../services/syncService';
import { Product, Topping, Order } from '../types';

// Additional types
export interface Category {
  _id: string;
  name: string;
  description: string;
  available: boolean;
  productCount: number;
}

interface DataContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, '_id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, '_id' | 'productCount'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;

  // Toppings
  toppings: Topping[];
  addTopping: (topping: Omit<Topping, '_id'>) => void;
  updateTopping: (id: string, topping: Partial<Topping>) => void;
  deleteTopping: (id: string) => void;
  getToppingById: (id: string) => Topping | undefined;
  getToppingsByCategory: (category: string) => Topping[];

  // Orders
  orders: Order[];
  addOrder: (order: any) => Promise<Order>;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  getOrderById: (id: string) => Order | undefined;
  getOrdersByStatus: (status: string) => Order[];

  // Loading state
  isLoading: boolean;

  // Utility functions
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useBackend, setUseBackend] = useState(true); // Always use backend first

  // Load data from backend or localStorage
  useEffect(() => {
    const initializeData = async () => {
      try {
        if (useBackend) {
          console.log('Loading data from backend API...');
          // Try to load from backend API
          const [productsData, categoriesData, toppingsData] = await Promise.all([
            productsAPI.getAll({ available: undefined }),
            categoriesAPI.getAll(),
            toppingsAPI.getAll()
          ]);

          console.log('Backend data loaded successfully:', {
            products: productsData?.length || 0,
            categories: categoriesData?.length || 0,
            toppings: toppingsData?.length || 0
          });

          setProducts(productsData || []);
          setCategories(categoriesData || []);
          setToppings(toppingsData || []);

          console.log('✅ Frontend now using BACKEND data!');

          // Load orders if user is authenticated
          if (isAuthenticated && user) {
            try {
              const ordersData = user.role === 'admin'
                ? await ordersAPI.getAllAdmin()
                : await ordersAPI.getAll();
              setOrders(ordersData);
            } catch (error) {
              console.log('Orders not loaded:', error);
              setOrders([]);
            }
          }

          setIsLoading(false);
        } else {
          // Fallback to localStorage
          const savedProducts = localStorage.getItem('shawarma_products');
          const savedCategories = localStorage.getItem('shawarma_categories');
          const savedToppings = localStorage.getItem('shawarma_toppings');
          const savedOrders = localStorage.getItem('shawarma_orders');

          if (savedProducts && savedCategories && savedToppings) {
            setProducts(JSON.parse(savedProducts));
            setCategories(JSON.parse(savedCategories));
            setToppings(JSON.parse(savedToppings));
            setOrders(savedOrders ? JSON.parse(savedOrders) : []);
            setIsLoading(false);
            return;
          }

          // If no localStorage data, initialize with empty arrays
          // The backend should be the primary source of data
          console.log('No localStorage data found, initializing with empty arrays');
          setProducts([]);
          setCategories([]);
          setToppings([]);
          setOrders([]);

          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading data from backend:', error);

        // Only fallback to localStorage if backend is completely unreachable
        if ((error as any)?.code === 'NETWORK_ERROR' || (error as any)?.message?.includes('Network Error')) {
          console.log('Backend unreachable, using localStorage fallback');
          setUseBackend(false);

          // Fallback to localStorage
          const savedProducts = localStorage.getItem('shawarma_products');
          const savedCategories = localStorage.getItem('shawarma_categories');
          const savedToppings = localStorage.getItem('shawarma_toppings');
          const savedOrders = localStorage.getItem('shawarma_orders');

          if (savedProducts && savedCategories && savedToppings) {
            setProducts(JSON.parse(savedProducts));
            setCategories(JSON.parse(savedCategories));
            setToppings(JSON.parse(savedToppings));
            setOrders(savedOrders ? JSON.parse(savedOrders) : []);
          } else {
            // Initialize with empty arrays if no localStorage data
            setProducts([]);
            setCategories([]);
            setToppings([]);
            setOrders([]);
          }
        } else {
          // For other errors, show empty state but keep trying backend
          console.log('Backend error, showing empty state but keeping backend enabled');
          setProducts([]);
          setCategories([]);
          setToppings([]);
          setOrders([]);
        }
        setIsLoading(false);
      }
    };

    initializeData();
  }, [isAuthenticated, user, useBackend]);

  // Set up real-time order synchronization for admin users
  useEffect(() => {
    // Check if auto-sync is disabled via environment variable
    const autoSyncDisabled = process.env.REACT_APP_DISABLE_AUTO_SYNC === 'true';

    if (autoSyncDisabled || !isAuthenticated || !user || user.role !== 'admin' || !useBackend) {
      syncService.stop();
      return;
    }

    console.log('🔄 Setting up order sync for admin...');

    syncService.start({
      interval: 30000, // Poll every 30 seconds (reduced from 10s)
      onOrdersUpdate: (updatedOrders) => {
        console.log('📦 Orders synced from server:', updatedOrders.length);

        // Use functional update to avoid dependency on orders
        setOrders(prevOrders => {
          // Check for new orders
          const newOrders = updatedOrders.filter(
            (newOrder: any) => !prevOrders.find((existingOrder: any) => existingOrder._id === newOrder._id)
          );

          // Check for status changes
          const statusChanges = updatedOrders.filter((updatedOrder: any) => {
            const existingOrder = prevOrders.find((o: any) => o._id === updatedOrder._id);
            return existingOrder && existingOrder.status !== updatedOrder.status;
          });

          // Show notifications for new orders
          if (newOrders.length > 0) {
            newOrders.forEach((order: any) => {
              toast.success(`🔔 Nouvelle commande: ${order.orderNumber}`, {
                duration: 5000,
              });
            });
          }

          // Show notifications for status changes
          if (statusChanges.length > 0) {
            statusChanges.forEach((order: any) => {
              toast(`📝 Commande ${order.orderNumber} mise à jour: ${order.status}`, {
                duration: 4000,
              });
            });
          }

          return updatedOrders;
        });
      },
      onError: (error) => {
        console.error('❌ Order sync error:', error);
      }
    });

    return () => {
      syncService.stop();
    };
  }, [isAuthenticated, user, useBackend]);

  // Set up order status tracking for customers
  useEffect(() => {
    // Check if auto-sync is disabled via environment variable
    const autoSyncDisabled = process.env.REACT_APP_DISABLE_AUTO_SYNC === 'true';

    if (autoSyncDisabled || !isAuthenticated || !user || user.role === 'admin' || !useBackend) {
      return;
    }

    console.log('🔄 Setting up order tracking for customer...');

    const trackingInterval = setInterval(async () => {
      try {
        const updatedOrders = await ordersAPI.getAll();

        // Use functional update to avoid dependency on orders
        setOrders(prevOrders => {
          if (prevOrders.length === 0) return updatedOrders;

          // Check for status changes
          const statusChanges = updatedOrders.filter((updatedOrder: any) => {
            const existingOrder = prevOrders.find((o: any) => o._id === updatedOrder._id);
            return existingOrder && existingOrder.status !== updatedOrder.status;
          });

          if (statusChanges.length > 0) {
            statusChanges.forEach((order: any) => {
              const statusMessages: Record<string, string> = {
                confirmed: '✅ Votre commande a été confirmée!',
                preparing: '👨‍🍳 Votre commande est en préparation',
                ready: '🎉 Votre commande est prête!',
                out_for_delivery: '🚗 Votre commande est en route',
                delivered: '✅ Votre commande a été livrée',
                cancelled: '❌ Votre commande a été annulée'
              };

              const message = statusMessages[order.status] || `Statut mis à jour: ${order.status}`;
              toast.success(`${message} (${order.orderNumber})`, {
                duration: 6000,
              });
            });
          }

          return updatedOrders;
        });
      } catch (error) {
        console.error('❌ Error tracking orders:', error);
      }
    }, 60000); // Poll every 60 seconds for customers (reduced from 15s)

    return () => {
      clearInterval(trackingInterval);
    };
  }, [isAuthenticated, user, useBackend]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('shawarma_products', JSON.stringify(products));
    }
  }, [products, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('shawarma_categories', JSON.stringify(categories));
    }
  }, [categories, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('shawarma_toppings', JSON.stringify(toppings));
    }
  }, [toppings, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('shawarma_orders', JSON.stringify(orders));
    }
  }, [orders, isLoading]);

  // Update product count in categories whenever products change
  useEffect(() => {
    setCategories(prevCategories =>
      prevCategories.map(cat => ({
        ...cat,
        productCount: products.filter(p => p.category === cat.name).length
      }))
    );
  }, [products]);

  // Product CRUD operations
  const addProduct = async (product: Omit<Product, '_id'>) => {
    console.log('🔄 Adding product:', product);
    console.log('🔄 Using backend:', useBackend);
    console.log('🔄 Auth token exists:', !!localStorage.getItem('token'));

    try {
      if (useBackend) {
        console.log('📡 Calling backend API to create product...');
        const newProduct = await productsAPI.create(product);
        console.log('✅ Backend product created:', newProduct);
        setProducts(prev => [...prev, newProduct]);
      }
      toast.success('Produit ajouté avec succès!');
    } catch (error) {
      console.log(product)
      console.error('❌ Error adding product:', error);
      toast.error('Erreur lors de l\'ajout du produit');
    }
  };

  const updateProduct = async (id: string, productUpdate: Partial<Product>) => {
    try {
      if (useBackend) {
        const updatedProduct = await productsAPI.update(id, productUpdate);
        setProducts(prev =>
          prev.map(p => (p._id === id ? updatedProduct : p))
        );
      } else {
        setProducts(prev =>
          prev.map(p => (p._id === id ? { ...p, ...productUpdate } : p))
        );
      }
      toast.success('Produit mis à jour avec succès!');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Erreur lors de la mise à jour du produit');
    }
  };

  const deleteProduct = async (id: string) => {
    console.log('🗑️ Deleting product:', id);
    console.log('🔄 Using backend:', useBackend);
    console.log('🔄 Auth token exists:', !!localStorage.getItem('token'));

    try {
      if (useBackend) {
        console.log('📡 Calling backend API to delete product...');
        await productsAPI.delete(id);
        console.log('✅ Backend product deleted');
      }
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Produit supprimé avec succès!');
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      toast.error('Erreur lors de la suppression du produit');
    }
  };

  const getProductById = (id: string) => {
    return products.find(p => p._id === id);
  };

  const getProductsByCategory = (category: string) => {
    return products.filter(p => p.category === category && p.available);
  };

  // Category CRUD operations
  const addCategory = async (category: Omit<Category, '_id' | 'productCount'>) => {
    try {
      if (useBackend) {
        const newCategory = await categoriesAPI.create(category);
        setCategories(prev => [...prev, { ...newCategory, productCount: 0 }]);
      } else {
        const newCategory: Category = {
          ...category,
          _id: `cat${Date.now()}`,
          productCount: 0
        };
        setCategories(prev => [...prev, newCategory]);
      }
      toast.success('Catégorie ajoutée avec succès!');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Erreur lors de l\'ajout de la catégorie');
    }
  };

  const updateCategory = async (id: string, categoryUpdate: Partial<Category>) => {
    try {
      if (useBackend) {
        const updatedCategory = await categoriesAPI.update(id, categoryUpdate);
        setCategories(prev =>
          prev.map(c => (c._id === id ? { ...updatedCategory, productCount: c.productCount } : c))
        );
      } else {
        setCategories(prev =>
          prev.map(c => (c._id === id ? { ...c, ...categoryUpdate } : c))
        );
      }
      toast.success('Catégorie mise à jour avec succès!');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Erreur lors de la mise à jour de la catégorie');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const category = categories.find(c => c._id === id);
      if (category && category.productCount > 0) {
        toast.error('Impossible de supprimer une catégorie contenant des produits');
        return;
      }

      if (useBackend) {
        await categoriesAPI.delete(id);
      }
      setCategories(prev => prev.filter(c => c._id !== id));
      toast.success('Catégorie supprimée avec succès!');
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const message = error.response?.data?.message || 'Erreur lors de la suppression de la catégorie';
      toast.error(message);
    }
  };

  const getCategoryById = (id: string) => {
    return categories.find(c => c._id === id);
  };

  // Topping CRUD operations
  const addTopping = async (topping: Omit<Topping, '_id'>) => {
    try {
      if (useBackend) {
        const newTopping = await toppingsAPI.create(topping);
        setToppings(prev => [...prev, newTopping]);
      } else {
        const newTopping: Topping = {
          ...topping,
          _id: `t${Date.now()}`
        };
        setToppings(prev => [...prev, newTopping]);
      }
      toast.success('Garniture ajoutée avec succès!');
    } catch (error) {
      console.error('Error adding topping:', error);
      toast.error('Erreur lors de l\'ajout de la garniture');
    }
  };

  const updateTopping = async (id: string, toppingUpdate: Partial<Topping>) => {
    try {
      if (useBackend) {
        const updatedTopping = await toppingsAPI.update(id, toppingUpdate);
        setToppings(prev =>
          prev.map(t => (t._id === id ? updatedTopping : t))
        );
      } else {
        setToppings(prev =>
          prev.map(t => (t._id === id ? { ...t, ...toppingUpdate } : t))
        );
      }
      toast.success('Garniture mise à jour avec succès!');
    } catch (error) {
      console.error('Error updating topping:', error);
      toast.error('Erreur lors de la mise à jour de la garniture');
    }
  };

  const deleteTopping = async (id: string) => {
    try {
      if (useBackend) {
        await toppingsAPI.delete(id);
      }
      setToppings(prev => prev.filter(t => t._id !== id));
      toast.success('Garniture supprimée avec succès!');
    } catch (error) {
      console.error('Error deleting topping:', error);
      toast.error('Erreur lors de la suppression de la garniture');
    }
  };

  const getToppingById = (id: string) => {
    return toppings.find(t => t._id === id);
  };

  const getToppingsByCategory = (category: string) => {
    return toppings.filter(t => t.category === category && t.available);
  };

  // Order CRUD operations
  const addOrder = async (order: any) => {
    try {
      if (useBackend) {
        const newOrder = await ordersAPI.create(order);
        setOrders(prev => [newOrder, ...prev]);
        toast.success(`Commande ${newOrder.orderNumber} créée avec succès!`);
        return newOrder;
      } else {
        const newOrder: Order = {
          ...order,
          _id: `o${Date.now()}`,
          orderNumber: `SH${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setOrders(prev => [newOrder, ...prev]);
        toast.success(`Commande ${newOrder.orderNumber} créée avec succès!`);
        return newOrder;
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erreur lors de la création de la commande');
      throw error;
    }
  };

  const updateOrder = async (id: string, orderUpdate: Partial<Order>) => {
    try {
      if (useBackend) {
        if (orderUpdate.status) {
          const updatedOrder = await ordersAPI.updateStatus(id, orderUpdate.status);
          setOrders(prev =>
            prev.map(o => (o._id === id ? updatedOrder : o))
          );
        }
      } else {
        setOrders(prev =>
          prev.map(o => (o._id === id ? { ...o, ...orderUpdate } : o))
        );
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Erreur lors de la mise à jour de la commande');
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      // Note: Usually orders are not deleted, just cancelled
      setOrders(prev => prev.filter(o => o._id !== id));
      toast.success('Commande supprimée avec succès!');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Erreur lors de la suppression de la commande');
    }
  };

  const getOrderById = (id: string) => {
    return orders.find(o => o._id === id);
  };

  const getOrdersByStatus = (status: string) => {
    if (status === 'all') return orders;
    return orders.filter(o => o.status === status);
  };

  // Force refresh data from backend
  const refreshData = async () => {
    console.log('Forcing data refresh from backend...');
    setIsLoading(true);
    setUseBackend(true);

    try {
      const [productsData, categoriesData, toppingsData] = await Promise.all([
        productsAPI.getAll({ available: undefined }),
        categoriesAPI.getAll(),
        toppingsAPI.getAll()
      ]);

      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setToppings(toppingsData || []);

      // Load orders if user is authenticated
      if (isAuthenticated && user) {
        try {
          const ordersData = user.role === 'admin'
            ? await ordersAPI.getAllAdmin()
            : await ordersAPI.getAll();
          setOrders(ordersData || []);
        } catch (error) {
          console.log('Orders not loaded during refresh:', error);
        }
      }

      toast.success('Données actualisées depuis le serveur!');
      console.log('Data refreshed successfully from backend');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Erreur lors de l\'actualisation des données');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DataContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        getProductsByCategory,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
        toppings,
        addTopping,
        updateTopping,
        deleteTopping,
        getToppingById,
        getToppingsByCategory,
        orders,
        addOrder,
        updateOrder,
        deleteOrder,
        getOrderById,
        getOrdersByStatus,
        isLoading,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};