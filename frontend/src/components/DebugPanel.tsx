import React from 'react';
import { useData } from '../context/DataContext';

const DebugPanel: React.FC = () => {
  const { products, categories, toppings, isLoading, refreshData } = useData();

  // Check if data looks like it's from backend (has MongoDB ObjectIds)
  const isBackendData = products.length > 0 && products[0]._id.length === 24;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50 max-w-xs">
      <h3 className="font-bold text-sm mb-2">🔧 Debug Panel</h3>
      <div className="text-xs space-y-1">
        <div>Products: {products.length}</div>
        <div>Categories: {categories.length}</div>
        <div>Toppings: {toppings.length}</div>
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div className={`font-semibold ${isBackendData ? 'text-green-600' : 'text-red-600'}`}>
          Source: {isBackendData ? '🌐 Backend' : '💾 Local/Mock'}
        </div>
        {products.length > 0 && (
          <div className="text-xs text-gray-500">
            Sample ID: {products[0]._id.substring(0, 8)}...
          </div>
        )}
      </div>
      <button
        onClick={refreshData}
        className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : '🔄 Refresh Backend'}
      </button>
      <button
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
        className="mt-1 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 w-full"
      >
        🗑️ Clear Cache & Reload
      </button>
      <button
        onClick={() => {
          console.log('🧪 Admin Auth Debug Info:');
          console.log('Auth token:', localStorage.getItem('token'));
          console.log('User:', localStorage.getItem('user'));
          console.log('Token exists:', !!localStorage.getItem('token'));
        }}
        className="mt-1 px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 w-full"
      >
        🧪 Debug Auth
      </button>
    </div>
  );
};

export default DebugPanel;