import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  BellIcon,
  CheckIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '../context/NotificationContext';

const NotificationPanel: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isNotificationPanelOpen,
    closeNotificationPanel,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  } = useNotifications();

  const formatTime = (dateString: string) => {
    const now = new Date();
    const notificationTime = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)} j`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_placed':
        return <ShoppingBagIcon className="w-5 h-5 text-green-600" />;
      case 'order_status_changed':
        return <ClockIcon className="w-5 h-5 text-blue-600" />;
      case 'payment_confirmed':
        return <CreditCardIcon className="w-5 h-5 text-purple-600" />;
      case 'delivery_update':
        return <TruckIcon className="w-5 h-5 text-orange-600" />;
      default:
        return <BellIcon className="w-5 h-5 text-secondary-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <AnimatePresence>
      {isNotificationPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeNotificationPanel}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Notification Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-100 bg-white">
              <div className="flex items-center space-x-3">
                <BellIcon className="w-6 h-6 text-primary-600" />
                <div>
                  <h2 className="text-xl font-display font-semibold text-secondary-900">
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <p className="text-sm text-secondary-600">
                      {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={closeNotificationPanel}
                className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-secondary-100">
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                  disabled={unreadCount === 0}
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>Tout marquer comme lu</span>
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>Tout supprimer</span>
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <BellIcon className="w-16 h-16 text-secondary-300 mb-4" />
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    Aucune notification
                  </h3>
                  <p className="text-secondary-600">
                    Vous serez notifié ici des mises à jour importantes
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-secondary-100">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${
                        notification.isRead ? 'opacity-75' : ''
                      } ${getPriorityColor(notification.priority)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`text-sm font-semibold ${
                                notification.isRead ? 'text-secondary-700' : 'text-secondary-900'
                              }`}>
                                {notification.title}
                              </h4>
                              <p className={`text-sm mt-1 ${
                                notification.isRead ? 'text-secondary-500' : 'text-secondary-700'
                              }`}>
                                {notification.message}
                              </p>
                              
                              {notification.orderNumber && (
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className="inline-block bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded-full">
                                    {notification.orderNumber}
                                  </span>
                                  {notification.status && (
                                    <span className="text-xs text-secondary-500 capitalize">
                                      {notification.status}
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              <p className="text-xs text-secondary-500 mt-2">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification._id)}
                                  className="p-1 text-secondary-400 hover:text-primary-600 transition-colors"
                                  title="Marquer comme lu"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification._id)}
                                className="p-1 text-secondary-400 hover:text-red-600 transition-colors"
                                title="Supprimer"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;