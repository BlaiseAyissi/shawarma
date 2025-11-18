import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { NotificationSound } from '../utils/notificationSound';
import toast from 'react-hot-toast';

interface Notification {
  _id: string;
  type: 'order_placed' | 'order_status_changed' | 'payment_confirmed' | 'delivery_update' | 'system';
  title: string;
  message: string;
  orderId?: string;
  orderNumber?: string;
  status?: string;
  isRead: boolean;
  createdAt: string;
  userId?: string;
  targetRole?: 'admin' | 'customer' | 'all'; // Who should see this notification
  priority: 'low' | 'medium' | 'high';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, '_id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  isNotificationPanelOpen: boolean;
  toggleNotificationPanel: () => void;
  closeNotificationPanel: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Load saved notifications from localStorage
    const savedNotifications = localStorage.getItem(`shawarma_notifications_${user._id}`);
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      // Only keep notifications from today (same day)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      const todayNotifications = parsed
        .filter((n: Notification) => {
          const notifDate = new Date(n.createdAt);
          notifDate.setHours(0, 0, 0, 0);
          return notifDate.getTime() === today.getTime();
        })
        .slice(0, 50); // Limit to 50 notifications
      
      setNotifications(todayNotifications);
    }
  }, [isAuthenticated, user]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (isAuthenticated && user && notifications.length > 0) {
      localStorage.setItem(`shawarma_notifications_${user._id}`, JSON.stringify(notifications));
    }
  }, [notifications, isAuthenticated, user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const addNotification = (notificationData: Omit<Notification, '_id' | 'isRead' | 'createdAt'>) => {
    if (!user) return;

    // Check if this notification is for the current user
    const targetRole = notificationData.targetRole || 'all';
    const shouldShow =
      targetRole === 'all' ||
      (targetRole === 'admin' && user.role === 'admin') ||
      (targetRole === 'customer' && user.role === 'customer') ||
      (notificationData.userId && notificationData.userId === user._id);

    if (!shouldShow) return;

    // Check for duplicate notifications (same order and type within last minute)
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const isDuplicate = notifications.some(n => 
      n.orderNumber === notificationData.orderNumber &&
      n.type === notificationData.type &&
      new Date(n.createdAt) > oneMinuteAgo
    );

    if (isDuplicate) {
      console.log('Duplicate notification prevented:', notificationData);
      return;
    }

    const notification: Notification = {
      ...notificationData,
      _id: Date.now().toString(),
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [notification, ...prev]);

    // Show toast notification
    const toastMessage = `${notification.title}: ${notification.message}`;

    switch (notification.priority) {
      case 'high':
        toast.success(toastMessage, {
          duration: 3000,
          icon: '🔔',
        });
        NotificationSound.playNotificationSound('success');
        break;
      case 'medium':
        toast(toastMessage, {
          duration: 3000,
          icon: '📢',
        });
        NotificationSound.playNotificationSound('info');
        break;
      case 'low':
        toast(toastMessage, {
          duration: 3000,
          icon: 'ℹ️',
        });
        NotificationSound.playBeep();
        break;
    }

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n._id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    if (user) {
      localStorage.removeItem(`shawarma_notifications_${user._id}`);
    }
  };

  const toggleNotificationPanel = () => {
    setIsNotificationPanelOpen(!isNotificationPanelOpen);
  };

  const closeNotificationPanel = () => {
    setIsNotificationPanelOpen(false);
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Clean up notifications from previous days periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setNotifications(prev => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        
        // Only keep notifications from today
        return prev.filter(n => {
          const notifDate = new Date(n.createdAt);
          notifDate.setHours(0, 0, 0, 0);
          return notifDate.getTime() === today.getTime();
        });
      });
    }, 60000); // Run every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        isNotificationPanelOpen,
        toggleNotificationPanel,
        closeNotificationPanel,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};