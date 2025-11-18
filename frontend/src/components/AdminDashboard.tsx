import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  ShoppingBagIcon, 
  Squares2X2Icon,
  TagIcon,
  SparklesIcon,
  XCircleIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import DashboardOverview from './admin/DashboardOverview';
import OrderManagement from './admin/OrderManagement';
import MenuManagement from './admin/MenuManagement';
import CategoryManagement from './admin/CategoryManagement';
import ToppingManagement from './admin/ToppingManagement';
import SettingsManagement from './admin/SettingsManagement';
import AdminAuthTest from './AdminAuthTest';
import OrderSyncIndicator from './OrderSyncIndicator';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Tableau de bord', icon: ChartBarIcon },
    { id: 'orders', name: 'Commandes', icon: ShoppingBagIcon },
    { id: 'menu', name: 'Menu', icon: Squares2X2Icon },
    { id: 'categories', name: 'Catégories', icon: TagIcon },
    { id: 'toppings', name: 'Garnitures', icon: SparklesIcon },
    { id: 'settings', name: 'Paramètres', icon: CogIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'orders':
        return <OrderManagement />;
      case 'menu':
        return <MenuManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'toppings':
        return <ToppingManagement />;
      case 'settings':
        return <SettingsManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Accès refusé</h1>
          <p className="text-secondary-600">Vous n'avez pas les permissions pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <div className="bg-white shadow-sm border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-secondary-900">
                Administration
              </h1>
              <p className="text-secondary-600 mt-1">
                Bienvenue, {user?.name}
              </p>
            </div>
            <div className="text-right space-y-2">
              <div>
                <p className="text-sm text-secondary-500">Dernière mise à jour</p>
                <p className="text-sm font-medium text-secondary-900">
                  {new Date().toLocaleString('fr-FR')}
                </p>
              </div>
              <OrderSyncIndicator />
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-8 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/*<AdminAuthTest />*/}
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;