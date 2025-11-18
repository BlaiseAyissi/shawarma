import { useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const useOrderNotifications = () => {
  const { orders } = useData();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const previousOrdersRef = useRef<typeof orders>([]);

  useEffect(() => {
    if (!user || orders.length === 0) return;

    const previousOrders = previousOrdersRef.current;

    // Check for new orders (admin only)
    if (user.role === 'admin') {
      const newOrders = orders.filter(
        order => !previousOrders.find(prev => prev._id === order._id)
      );

      newOrders.forEach(order => {
        addNotification({
          type: 'order_placed',
          title: 'Nouvelle commande',
          message: `Nouvelle commande ${order.orderNumber} reçue`,
          orderId: order._id,
          orderNumber: order.orderNumber,
          targetRole: 'admin',
          priority: 'high'
        });
      });
    }

    // Check for status changes
    orders.forEach(order => {
      const previousOrder = previousOrders.find(prev => prev._id === order._id);
      
      if (previousOrder && previousOrder.status !== order.status) {
        const statusMessages: Record<string, { title: string; message: string }> = {
          confirmed: {
            title: 'Commande confirmée',
            message: `Votre commande ${order.orderNumber} a été confirmée`
          },
          preparing: {
            title: 'En préparation',
            message: `Votre commande ${order.orderNumber} est en cours de préparation`
          },
          ready: {
            title: 'Commande prête',
            message: `Votre commande ${order.orderNumber} est prête!`
          },
          out_for_delivery: {
            title: 'En livraison',
            message: `Votre commande ${order.orderNumber} est en route`
          },
          delivered: {
            title: 'Commande livrée',
            message: `Votre commande ${order.orderNumber} a été livrée`
          },
          cancelled: {
            title: 'Commande annulée',
            message: `Votre commande ${order.orderNumber} a été annulée`
          }
        };

        const statusInfo = statusMessages[order.status] || {
          title: 'Mise à jour',
          message: `Statut de la commande ${order.orderNumber} mis à jour`
        };

        addNotification({
          type: 'order_status_changed',
          title: statusInfo.title,
          message: statusInfo.message,
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          targetRole: user.role === 'admin' ? 'admin' : 'customer',
          priority: 'medium'
        });
      }
    });

    previousOrdersRef.current = orders;
  }, [orders, user, addNotification]);
};
