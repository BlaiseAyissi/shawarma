import React, { useState, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { syncService } from '../services/syncService';

const OrderSyncIndicator: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      setIsActive(syncService.isRunning());
      if (syncService.isRunning()) {
        setLastSync(new Date());
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, []);

  if (!isActive) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-gray-600">
      <ArrowPathIcon className="w-4 h-4 animate-spin text-green-500" />
      <span>Synchronisation active</span>
      {lastSync && (
        <span className="text-gray-400">
          • {lastSync.toLocaleTimeString('fr-FR')}
        </span>
      )}
    </div>
  );
};

export default OrderSyncIndicator;
