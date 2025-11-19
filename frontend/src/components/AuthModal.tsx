import React, { useState } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const AuthModal: React.FC = () => {
  const { authModalOpen, authModalMode, hideAuthModal, showAuthModal, login, register } = useAuth();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: false
      });
    }
  };

  const handleBlur = (field: keyof typeof errors) => {
    setTouched({
      ...touched,
      [field]: true
    });
    
    // Validate on blur
    validateField(field);
  };

  const validateField = (field: keyof typeof errors) => {
    let isValid = true;
    
    switch (field) {
      case 'name':
        isValid = formData.name.trim().length >= 2;
        break;
      case 'email':
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
        break;
      case 'password':
        isValid = formData.password.length >= 6;
        break;
      case 'confirmPassword':
        isValid = formData.confirmPassword === formData.password;
        break;
    }
    
    setErrors({
      ...errors,
      [field]: !isValid
    });
    
    return isValid;
  };

  const validateForm = () => {
    const fields: (keyof typeof errors)[] = authModalMode === 'login' 
      ? ['email', 'password']
      : ['name', 'email', 'password', 'confirmPassword'];
    
    const newErrors = { ...errors };
    let isValid = true;
    
    fields.forEach(field => {
      const fieldValid = validateField(field);
      if (!fieldValid) {
        newErrors[field] = true;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    
    setIsLoading(true);

    try {
      if (authModalMode === 'login') {
        await login(formData.email, formData.password);
        toast.success('Connexion réussie!');
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Les mots de passe ne correspondent pas');
          setIsLoading(false);
          return;
        }
        await register(formData);
        toast.success('Inscription réussie!');
      }
      hideAuthModal();
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        address: ''
      });
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {authModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={hideAuthModal}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-secondary-100">
                <h2 className="text-2xl font-display font-bold text-secondary-900">
                  {authModalMode === 'login' ? t('auth.login') : t('auth.register')}
                </h2>
                <button
                  onClick={hideAuthModal}
                  className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {authModalMode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      {t('auth.name')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('name')}
                      required
                      className={`input-field ${touched.name && errors.name ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                      placeholder="Jean Dupont"
                    />
                    {touched.name && errors.name && (
                      <p className="text-red-500 text-sm mt-1">Le nom doit contenir au moins 2 caractères</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('email')}
                    required
                    className={`input-field ${touched.email && errors.email ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                    placeholder="jean@example.com"
                  />
                  {touched.email && errors.email && (
                    <p className="text-red-500 text-sm mt-1">Veuillez entrer une adresse email valide</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('password')}
                      required
                      className={`input-field pr-12 ${touched.password && errors.password ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {touched.password && errors.password && (
                    <p className="text-red-500 text-sm mt-1">Le mot de passe doit contenir au moins 6 caractères</p>
                  )}
                </div>

                {authModalMode === 'register' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        {t('auth.confirmPassword')}
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('confirmPassword')}
                        required
                        className={`input-field ${touched.confirmPassword && errors.confirmPassword ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                        placeholder="••••••••"
                      />
                      {touched.confirmPassword && errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">Les mots de passe ne correspondent pas</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        {t('auth.phone')}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="+237 6XX XXX XXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        {t('auth.address')}
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="input-field resize-none"
                        placeholder="Votre adresse de livraison..."
                      />
                    </div>
                  </>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Chargement...
                    </div>
                  ) : (
                    authModalMode === 'login' ? t('auth.loginButton') : t('auth.registerButton')
                  )}
                </motion.button>

                {authModalMode === 'login' && (
                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      {t('auth.forgotPassword')}
                    </button>
                  </div>
                )}

                <div className="text-center pt-4 border-t border-secondary-100">
                  <p className="text-sm text-secondary-600">
                    {authModalMode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const newMode = authModalMode === 'login' ? 'register' : 'login';
                      hideAuthModal();
                      setTimeout(() => {
                        showAuthModal(newMode);
                      }, 100);
                    }}
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    {authModalMode === 'login' ? t('auth.registerHere') : t('auth.loginHere')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;