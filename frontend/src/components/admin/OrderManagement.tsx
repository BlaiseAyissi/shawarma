import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EyeIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '../../context/NotificationContext';
import { useData } from '../../context/DataContext';
import { Order, OrderItem } from '../../types';
import OrderReceipt from '../OrderReceipt';
import toast from 'react-hot-toast';

const OrderManagement: React.FC = () => {
  const { addNotification } = useNotifications();
  const { orders: allOrders, updateOrder, isLoading } = useData();
  
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  // Initialize filtered orders
  useEffect(() => {
    setFilteredOrders(allOrders);
  }, [allOrders]);

  // Filter orders
  useEffect(() => {
    let filtered = allOrders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.deliveryAddress.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.deliveryAddress.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [allOrders, statusFilter, searchTerm]);

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

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const order = allOrders.find(o => o._id === orderId);
    if (!order) return;

    updateOrder(orderId, { status: newStatus as any });

    // Trigger notification for status change
    const statusMessages = {
      confirmed: 'Votre commande a été confirmée',
      preparing: 'Votre commande est en cours de préparation',
      ready: 'Votre commande est prête pour la livraison',
      out_for_delivery: 'Votre commande est en cours de livraison',
      delivered: 'Votre commande a été livrée',
      cancelled: 'Votre commande a été annulée'
    };

    const message = statusMessages[newStatus as keyof typeof statusMessages];
    if (message) {
      // Send notification to the customer who placed the order
      addNotification({
        type: 'order_status_changed',
        title: 'Mise à jour de commande',
        message: `${message} - Commande ${order.orderNumber}`,
        orderNumber: order.orderNumber,
        status: newStatus,
        targetRole: 'customer',
        userId: order.userId, // Target specific customer
        priority: newStatus === 'delivered' ? 'high' : 'medium'
      });

      toast.success(`Commande ${order.orderNumber} mise à jour: ${newStatus}`);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts', count: allOrders.length },
    { value: 'pending', label: 'En attente', count: allOrders.filter((o: Order) => o.status === 'pending').length },
    { value: 'confirmed', label: 'Confirmé', count: allOrders.filter((o: Order) => o.status === 'confirmed').length },
    { value: 'preparing', label: 'En préparation', count: allOrders.filter((o: Order) => o.status === 'preparing').length },
    { value: 'ready', label: 'Prêt', count: allOrders.filter((o: Order) => o.status === 'ready').length },
    { value: 'out_for_delivery', label: 'En livraison', count: allOrders.filter((o: Order) => o.status === 'out_for_delivery').length },
    { value: 'delivered', label: 'Livré', count: allOrders.filter((o: Order) => o.status === 'delivered').length },
    { value: 'cancelled', label: 'Annulé', count: allOrders.filter((o: Order) => o.status === 'cancelled').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-secondary-900">
            Gestion des Commandes
          </h2>
          <p className="text-secondary-600 mt-1">
            Gérez et suivez toutes les commandes
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro, nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
              >
                {status.label} ({status.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="card">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-secondary-600">Chargement des commandes...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <FunnelIcon className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">Aucune commande trouvée</h3>
            <p className="text-secondary-600">Aucune commande ne correspond à vos critères de recherche.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Commande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Articles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-secondary-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-sm text-secondary-500">
                        {order.paymentMethod.toUpperCase()} • {order.paymentStatus}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-secondary-900">{order.deliveryAddress.city}</div>
                      <div className="text-sm text-secondary-500">{order.deliveryAddress.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-secondary-900">
                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-secondary-500 max-w-xs">
                        {order.items.map((item, idx) => (
                          <div key={idx}>
                            {item.quantity}x {item.productName} ({item.size})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-secondary-900">
                        {formatPrice(order.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-primary-600 hover:text-primary-900 p-1"
                        title="Voir détails"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="text-xs border border-secondary-200 rounded px-2 py-1 ml-2"
                      >
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmé</option>
                        <option value="preparing">Préparation</option>
                        <option value="ready">Prêt</option>
                        <option value="out_for_delivery">En livraison</option>
                        <option value="delivered">Livré</option>
                        <option value="cancelled">Annulé</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowReceipt(true)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <PrinterIcon className="w-5 h-5" />
                      <span>Imprimer</span>
                    </button>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-secondary-900">Adresse de Livraison</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <p>{selectedOrder.deliveryAddress.street}</p>
                        <p>{selectedOrder.deliveryAddress.city}</p>
                        <p><span className="font-medium">Téléphone:</span> {selectedOrder.deliveryAddress.phone}</p>
                        {selectedOrder.deliveryAddress.instructions && (
                          <p><span className="font-medium">Instructions:</span> {selectedOrder.deliveryAddress.instructions}</p>
                        )}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-secondary-900">Détails de la Commande</h4>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item: OrderItem, index: number) => (
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

                      <div className="border-t border-secondary-200 pt-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Total:</span>
                          <span className="text-primary-600">{formatPrice(selectedOrder.total)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusIcon(selectedOrder.status)}
                          <span className="ml-2 capitalize">{selectedOrder.status.replace('_', ' ')}</span>
                        </span>
                        <select
                          value={selectedOrder.status}
                          onChange={(e) => {
                            updateOrderStatus(selectedOrder._id, e.target.value);
                            setSelectedOrder({...selectedOrder, status: e.target.value as any});
                          }}
                          className="border border-secondary-200 rounded px-3 py-2"
                        >
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmé</option>
                          <option value="preparing">En préparation</option>
                          <option value="ready">Prêt</option>
                          <option value="out_for_delivery">En livraison</option>
                          <option value="delivered">Livré</option>
                          <option value="cancelled">Annulé</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReceipt(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              <div className="bg-gray-100 rounded-2xl shadow-2xl max-w-2xl w-full p-6">
                <OrderReceipt 
                  order={selectedOrder} 
                  onClose={() => setShowReceipt(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderManagement;