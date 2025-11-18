import { ordersAPI } from './api';

export interface SyncConfig {
  enabled: boolean;
  interval: number; // milliseconds
  onOrdersUpdate?: (orders: any[]) => void;
  onError?: (error: any) => void;
}

class SyncService {
  private intervalId: NodeJS.Timeout | null = null;
  private config: SyncConfig = {
    enabled: false,
    interval: 5000, // 5 seconds default
    onOrdersUpdate: undefined,
    onError: undefined,
  };
  private lastOrdersHash: string = '';

  start(config: Partial<SyncConfig>) {
    this.config = { ...this.config, ...config, enabled: true };
    
    if (this.intervalId) {
      this.stop();
    }

    console.log('🔄 Starting order sync service...');
    
    // Initial sync
    this.syncOrders();
    
    // Set up polling
    this.intervalId = setInterval(() => {
      this.syncOrders();
    }, this.config.interval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.config.enabled = false;
      console.log('⏸️ Order sync service stopped');
    }
  }

  private async syncOrders() {
    if (!this.config.enabled) return;

    try {
      // Fetch latest orders
      const orders = await ordersAPI.getAllAdmin();
      
      // Create a simple hash to detect changes
      const ordersHash = JSON.stringify(orders.map((o: any) => ({ 
        id: o._id, 
        status: o.status,
        updatedAt: o.updatedAt || o.createdAt 
      })));

      // Check if orders have changed
      if (ordersHash !== this.lastOrdersHash) {
        console.log('📦 Orders updated, syncing...');
        this.lastOrdersHash = ordersHash;
        
        if (this.config.onOrdersUpdate) {
          this.config.onOrdersUpdate(orders);
        }
      }
    } catch (error) {
      console.error('❌ Error syncing orders:', error);
      if (this.config.onError) {
        this.config.onError(error);
      }
    }
  }

  isRunning(): boolean {
    return this.intervalId !== null;
  }

  updateInterval(interval: number) {
    this.config.interval = interval;
    if (this.isRunning()) {
      this.stop();
      this.start(this.config);
    }
  }
}

export const syncService = new SyncService();
