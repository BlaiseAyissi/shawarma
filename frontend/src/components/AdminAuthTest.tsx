import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const AdminAuthTest: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { addProduct, deleteProduct } = useData();

  const testCreate = async () => {
    console.log('🧪 Testing create operation...');
    try {
      await addProduct({
        name: 'Test Product from Admin',
        description: 'This is a test product created from the admin panel',
        basePrice: 1500,
        sizeVariations: [
          { size: 'small', name: 'Petit', price: 0, available: true },
          { size: 'large', name: 'Grand', price: 500, available: true }
        ],
        category: 'Shawarma',
        image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop',
        toppings: [],
        available: true
      });
      console.log('✅ Create test successful');
    } catch (error) {
      console.error('❌ Create test failed:', error);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="font-bold text-yellow-800 mb-2">🧪 Admin Authentication Test</h3>
      <div className="text-sm space-y-2">
        <div>
          <strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
        </div>
        <div>
          <strong>User:</strong> {user?.name || 'None'}
        </div>
        <div>
          <strong>Role:</strong> {user?.role || 'None'}
        </div>
        <div>
          <strong>Token exists:</strong> {localStorage.getItem('token') ? '✅ Yes' : '❌ No'}
        </div>
        <div>
          <strong>Token preview:</strong> {localStorage.getItem('token')?.substring(0, 20) || 'None'}...
        </div>
      </div>
      <div className="mt-4 space-x-2">
        <button
          onClick={testCreate}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          disabled={!isAuthenticated || user?.role !== 'admin'}
        >
          🧪 Test Create Product
        </button>
        <button
          onClick={() => {
            console.log('Current auth state:', { isAuthenticated, user, token: localStorage.getItem('token') });
          }}
          className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
        >
          📋 Log Auth State
        </button>
      </div>
    </div>
  );
};

export default AdminAuthTest;