import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { useData } from '../../context/DataContext';
import { Order } from '../../types';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  todayOrders: number;
  todayRevenue: number;
  averageOrderValue: number;
  completionRate: number;
}

const DashboardOverview: React.FC = () => {
  const { orders, products } = useData();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate real statistics from orders
  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Total orders and revenue
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    // Unique customers (by userId)
    const uniqueCustomers = new Set(orders.map(order => order.userId)).size;
    
    // Pending orders
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    
    // Today's orders and revenue
    const todayOrders = orders.filter(order => 
      new Date(order.createdAt) >= todayStart
    );
    const todayOrdersCount = todayOrders.length;
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Completion rate (delivered / total)
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    const completionRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;
    
    return {
      totalOrders,
      totalRevenue,
      totalCustomers: uniqueCustomers,
      pendingOrders,
      todayOrders: todayOrdersCount,
      todayRevenue,
      averageOrderValue,
      completionRate
    };
  }, [orders]);

  // Get recent orders (last 5)
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [orders]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'out_for_delivery': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'confirmed': return <CheckCircleIcon className="w-4 h-4" />;
      case 'preparing': return <ClockIcon className="w-4 h-4" />;
      case 'ready': return <CheckCircleIcon className="w-4 h-4" />;
      case 'out_for_delivery': return <ClockIcon className="w-4 h-4" />;
      case 'delivered': return <CheckCircleIcon className="w-4 h-4" />;
      case 'cancelled': return <XCircleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-display font-bold mb-2">
          Tableau de bord - House of Shawarma
        </h2>
        <p className="text-primary-100">
          Bienvenue dans votre espace d'administration. Voici un aperçu de votre activité.
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Commandes Totales</p>
              <p className="text-3xl font-bold text-secondary-900">
                {isLoading ? '...' : stats.totalOrders}
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12% ce mois</span>
              </div>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <ShoppingBagIcon className="w-8 h-8 text-primary-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Chiffre d'affaires</p>
              <p className="text-3xl font-bold text-secondary-900">
                {isLoading ? '...' : formatPrice(stats.totalRevenue)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+8% ce mois</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Clients</p>
              <p className="text-3xl font-bold text-secondary-900">
                {isLoading ? '...' : stats.totalCustomers}
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+15% ce mois</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <UsersIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">En attente</p>
              <p className="text-3xl font-bold text-secondary-900">
                {isLoading ? '...' : stats.pendingOrders}
              </p>
              <div className="flex items-center mt-2">
                <ClockIcon className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm text-yellow-600">À traiter</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Today's Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Performance du jour</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-secondary-600">Commandes aujourd'hui</span>
              <span className="font-semibold text-secondary-900">{stats.todayOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary-600">Revenus aujourd'hui</span>
              <span className="font-semibold text-secondary-900">{formatPrice(stats.todayRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary-600">Panier moyen</span>
              <span className="font-semibold text-secondary-900">{formatPrice(stats.averageOrderValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary-600">Taux de completion</span>
              <span className="font-semibold text-green-600">{stats.completionRate}%</span>
            </div>
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 card"
        >
          <div className="p-6 border-b border-secondary-100">
            <h3 className="text-lg font-semibold text-secondary-900">Commandes récentes</h3>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="animate-pulse flex items-center space-x-4">
                    <div className="h-4 bg-secondary-200 rounded w-20"></div>
                    <div className="h-4 bg-secondary-200 rounded w-32"></div>
                    <div className="h-4 bg-secondary-200 rounded w-16"></div>
                    <div className="h-4 bg-secondary-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-secondary-500">
                    <ShoppingBagIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucune commande pour le moment</p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium text-secondary-900">{order.orderNumber}</p>
                          <p className="text-sm text-secondary-600">
                            {order.deliveryAddress.city} - {order.deliveryAddress.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold text-secondary-900">
                          {formatPrice(order.total)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </span>
                        <span className="text-sm text-secondary-500">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
            <ShoppingBagIcon className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-primary-700">Voir toutes les commandes</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <ChartBarIcon className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-700">Ajouter un produit</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <UsersIcon className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-700">Gérer les clients</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardOverview;