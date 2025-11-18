import React from 'react';
import { motion } from 'framer-motion';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../context/NotificationContext';

const NotificationBell: React.FC = () => {
  const { unreadCount, toggleNotificationPanel } = useNotifications();

  return (
    <button
      onClick={toggleNotificationPanel}
      className="relative p-2 text-secondary-600 hover:text-primary-600 transition-colors"
      title="Notifications"
    >
      <BellIcon className="w-6 h-6" />
      
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </motion.div>
      )}
      
      {unreadCount > 0 && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 opacity-75"
        />
      )}
    </button>
  );
};

export default NotificationBell;