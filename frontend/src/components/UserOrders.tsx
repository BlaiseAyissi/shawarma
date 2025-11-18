import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  EyeIcon,
  XMarkIcon,
  TruckIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { Order, OrderItem } from '../types';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

const UserOrders: React.FC = () => {
  const { orders: allOrders } = useData();
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Filter orders for current user
  const orders = allOrders.filter(order => order.userId === user?._id);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Mock data for demo if no real orders
  const mockOrders: Order[] = orders.length === 0 ? [
        {
          _id: '1',
          orderNumber: 'SH001234',
          items: [
            {
              productName: 'Shawarma Classique',
              quantity: 2,
              size: 'medium',
              toppings: ['Tomates', 'Oignons', 'Sauce Ail'],
              price: 5000
            },
            {
              productName: 'Falafel Wrap',
              quantity: 1,
              size: 'large',
              toppings: ['Houmous', 'Salade'],
              price: 2700
            }
          ],
          total: 8200,
          status: 'preparing',
          paymentMethod: 'stripe',
          paymentStatus: 'paid',
          deliveryAddress: {
            street: '123 Rue de la Paix',
            city: 'Douala',
            phone: '+237612345678',
            instructions: 'Sonner à la porte principale'
          },
          createdAt: new Date().toISOString(),
          estimatedDeliveryTime: new Date(Date.now() + 25 * 60 * 1000).toISOString()
        } as any,
        {
          _id: '2',
          orderNumber: 'SH001220',
          items: [
            {
              productName: 'Shawarma Poulet',
              quantity: 1,
              size: 'large',
              toppings: ['Tomates', 'Salade', 'Sauce Piquante'],
              price: 3300
            }
          ],
          total: 3800,
          status: 'delivered',
          paymentMethod: 'momo',
          paymentStatus: 'paid',
          deliveryAddress: {
            street: '456 Avenue du Commerce',
            city: 'Yaoundé',
            phone: '+237687654321'
          },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          actualDeliveryTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString()
        } as any,
        {
          _id: '3',
          orderNumber: 'SH001205',
          items: [
            {
              productName: 'Shawarma Mixte',
              quantity: 1,
              size: 'medium',
              toppings: ['Tomates', 'Concombres', 'Fromage'],
              price: 3360
            }
          ],
          total: 3860,
          status: 'cancelled',
          paymentMethod: 'cash',
          paymentStatus: 'failed',
          deliveryAddress: {
            street: '789 Boulevard Central',
            city: 'Douala',
            phone: '+237698765432'
          },
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        } as any
      ] : [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'out_for_delivery': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-5 h-5" />;
      case 'confirmed': return <CheckCircleIcon className="w-5 h-5" />;
      case 'preparing': return <ClockIcon className="w-5 h-5" />;
      case 'ready': return <CheckCircleIcon className="w-5 h-5" />;
      case 'out_for_delivery': return <TruckIcon className="w-5 h-5" />;
      case 'delivered': return <CheckCircleIcon className="w-5 h-5" />;
      case 'cancelled': return <XCircleIcon className="w-5 h-5" />;
      default: return <ClockIcon className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'preparing': return 'En préparation';
      case 'ready': return 'Prête';
      case 'out_for_delivery': return 'En livraison';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'stripe': return <CreditCardIcon className="w-4 h-4" />;
      case 'momo': return <DevicePhoneMobileIcon className="w-4 h-4" />;
      case 'cash': return <BanknotesIcon className="w-4 h-4" />;
      default: return <CreditCardIcon className="w-4 h-4" />;
    }
  };

  const getPaymentText = (method: string) => {
    switch (method) {
      case 'stripe': return 'Carte bancaire';
      case 'momo': return 'Mobile Money';
      case 'cash': return 'Espèces';
      default: return method;
    }
  };

  // Use real orders if available, otherwise show mock data
  const displayOrders = orders;

  const filteredOrders = displayOrders.filter(order => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'current') return ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status);
    if (statusFilter === 'completed') return ['delivered'].includes(order.status);
    if (statusFilter === 'cancelled') return ['cancelled'].includes(order.status);
    return order.status === statusFilter;
  });

  const statusOptions = [
    { value: 'all', label: 'Toutes', count: displayOrders.length },
    { value: 'current', label: 'En cours', count: displayOrders.filter(o => ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)).length },
    { value: 'completed', label: 'Terminées', count: displayOrders.filter(o => o.status === 'delivered').length },
    { value: 'cancelled', label: 'Annulées', count: displayOrders.filter(o => o.status === 'cancelled').length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-secondary-900">
            Mes Commandes
          </h1>
          <p className="text-secondary-600 mt-2">
            Suivez l'état de vos commandes et consultez votre historique
          </p>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-secondary-700 hover:bg-secondary-50 border border-secondary-200'
                }`}
              >
                {status.label} ({status.count})
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="card p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-secondary-200 rounded w-32"></div>
                  <div className="h-6 bg-secondary-200 rounded w-24"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-secondary-200 rounded w-full"></div>
                  <div className="h-3 bg-secondary-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card p-12 text-center">
            <ClockIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              Aucune commande trouvée
            </h3>
            <p className="text-secondary-600 mb-6">
              {statusFilter === 'all' 
                ? "Vous n'avez pas encore passé de commande."
                : `Aucune commande ${statusOptions.find(s => s.value === statusFilter)?.label.toLowerCase()}.`
              }
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="btn-primary"
            >
              Commander maintenant
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                      Commande {order.orderNumber}
                    </h3>
                    <p className="text-sm text-secondary-600">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-2">{getStatusText(order.status)}</span>
                    </span>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
                      title="Voir détails"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-secondary-600 mb-1">Articles</p>
                    <p className="font-medium text-secondary-900">
                      {order.items.length} article{order.items.length > 1 ? 's' : ''}
                    </p>
                    <div className="text-xs text-secondary-500 mt-1">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <div key={idx}>
                          {item.quantity}x {item.productName}
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div>+{order.items.length - 2} autre{order.items.length > 3 ? 's' : ''}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-secondary-600 mb-1">Total</p>
                    <p className="font-bold text-lg text-primary-600">
                      {formatPrice(order.total)}
                    </p>
                    <div className="flex items-center text-xs text-secondary-500 mt-1">
                      {getPaymentIcon(order.paymentMethod)}
                      <span className="ml-1">{getPaymentText(order.paymentMethod)}</span>
                      <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 
                        order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        { (order.paymentMethod === 'cash' && order.status === 'delivered') ? order.paymentStatus = 'paid' : 
                          order.paymentStatus === 'paid' ? 'Payé' : 
                          order.paymentStatus === 'failed' ? 'Échec' : 'En attente'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-secondary-600 mb-1">
                      {order.status === 'delivered' ? 'Livré le' : 'Livraison estimée'}
                    </p>
                    <p className="font-medium text-secondary-900">
                      {order.actualDeliveryTime 
                        ? formatTime(order.actualDeliveryTime)
                        : order.estimatedDeliveryTime 
                        ? formatTime(order.estimatedDeliveryTime)
                        : 'À déterminer'
                      }
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Order Detail Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedOrder(null)}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-secondary-100">
                    <div>
                      <h3 className="text-2xl font-display font-bold text-secondary-900">
                        Commande {selectedOrder.orderNumber}
                      </h3>
                      <p className="text-secondary-600 mt-1">
                        {formatDate(selectedOrder.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        <span className="ml-2">{getStatusText(selectedOrder.status)}</span>
                      </span>
                      <div className="text-right">
                        <p className="text-sm text-secondary-600">Total</p>
                        <p className="text-2xl font-bold text-primary-600">
                          {formatPrice(selectedOrder.total)}
                        </p>
                      </div>
                    </div>



                    {/* Items */}
                    <div>
                      <h4 className="text-lg font-semibold text-secondary-900 mb-3">Articles commandés</h4>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-medium text-secondary-900">{item.productName}</h5>
                                <p className="text-sm text-secondary-600">
                                  Quantité: {item.quantity} • Taille: {item.size}
                                </p>
                                {item.selectedToppings && item.selectedToppings.length > 0 && (
                                  <p className="text-sm text-secondary-500">
                                    Garnitures: {item.selectedToppings.map((t: any) => t.name).join(', ')}
                                  </p>
                                )}
                              </div>
                              <span className="font-semibold text-secondary-900">
                                {formatPrice(item.itemTotal)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div>
                      <h4 className="text-lg font-semibold text-secondary-900 mb-3">Informations de livraison</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <p><strong>Adresse:</strong> {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city}</p>
                        <p><strong>Téléphone:</strong> {selectedOrder.deliveryAddress.phone}</p>
                        {selectedOrder.deliveryAddress.instructions && (
                          <p><strong>Instructions:</strong> {selectedOrder.deliveryAddress.instructions}</p>
                        )}
                        <div className="flex items-center mt-3">
                          {getPaymentIcon(selectedOrder.paymentMethod)}
                          <span className="ml-2">{getPaymentText(selectedOrder.paymentMethod)}</span>
                          <span className={`ml-3 px-2 py-1 rounded text-xs ${
                            selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 
                            selectedOrder.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' : 
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {selectedOrder.paymentStatus === 'paid' ? 'Payé' : 
                             selectedOrder.paymentStatus === 'failed' ? 'Échec de paiement' : 'Paiement en attente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserOrders;