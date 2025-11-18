import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';

const AdminRoute: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">Connexion requise</h1>
          <p className="text-secondary-600 mb-6">Vous devez être connecté pour accéder à cette page.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn-primary"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">Accès refusé</h1>
          <p className="text-secondary-600 mb-6">Vous n'avez pas les permissions administrateur.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn-primary"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
};

export default AdminRoute;