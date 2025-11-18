import { useEffect } from 'react';
import { useOrderNotifications } from '../hooks/useOrderNotifications';

/**
 * This component manages order synchronization and notifications
 * It should be placed inside the DataProvider and NotificationProvider
 */
const OrderSyncManager: React.FC = () => {
  // Enable order notifications
  useOrderNotifications();

  useEffect(() => {
    console.log('🔔 Order sync manager initialized');
  }, []);

  return null; // This component doesn't render anything
};

export default OrderSyncManager;
