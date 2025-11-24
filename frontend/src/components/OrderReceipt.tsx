import React from 'react';
import { Order } from '../types';
import { PrinterIcon } from '@heroicons/react/24/outline';

interface OrderReceiptProps {
  order: Order;
  onClose?: () => void;
}

const OrderReceipt: React.FC<OrderReceiptProps> = ({ order, onClose }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-container">
      {/* Screen View - Not printed */}
      <div className="no-print mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Reçu de Commande</h2>
        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className="btn-primary flex items-center space-x-2"
          >
            <PrinterIcon className="w-5 h-5" />
            <span>Imprimer</span>
          </button>
          {onClose && (
            <button onClick={onClose} className="btn-secondary">
              Fermer
            </button>
          )}
        </div>
      </div>

      {/* Receipt Content - Will be printed */}
      <div className="receipt-content bg-white p-6 max-w-sm mx-auto border border-gray-300">
        {/* Header */}
        <div className="text-center mb-4 pb-4 border-b-2 border-dashed border-gray-400">
          <h1 className="text-2xl font-bold">THE HOUSE OF SHAWARMA</h1>
          {/*<p className="text-xs mt-2">Tel: +237 XXX XXX XXX</p>*/}
        </div>

        {/* Order Info */}
        <div className="mb-4 pb-4 border-b border-dashed border-gray-400">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold">N° Commande:</span>
            <span className="font-bold">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Date:</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Statut:</span>
            <span className="font-semibold uppercase">{order.status}</span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-4 pb-4 border-b border-dashed border-gray-400">
          <h3 className="font-bold text-sm mb-2">CLIENT</h3>
          <p className="text-sm">{order.deliveryAddress.phone}</p>
          <p className="text-sm">{order.deliveryAddress.street}</p>
          <p className="text-sm">{order.deliveryAddress.neighborhood}, {order.deliveryAddress.city}</p>
          {order.deliveryAddress.instructions && (
            <p className="text-xs mt-1 italic">Note: {order.deliveryAddress.instructions}</p>
          )}
        </div>

        {/* Items */}
        <div className="mb-4 pb-4 border-b border-dashed border-gray-400">
          <h3 className="font-bold text-sm mb-3">ARTICLES</h3>
          {order.items.map((item, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.productName}</p>
                  <p className="text-xs text-gray-600">
                    Taille: {item.size} | Qté: {item.quantity}
                  </p>
                  {item.selectedToppings && item.selectedToppings.length > 0 && (
                    <p className="text-xs text-gray-600">
                      + {item.selectedToppings.map(t => t.name).join(', ')}
                    </p>
                  )}
                  {item.customizations && (
                    <p className="text-xs italic text-gray-600">
                      "{item.customizations}"
                    </p>
                  )}
                </div>
                <span className="font-semibold text-sm ml-2">
                  {formatPrice(item.itemTotal)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mb-4 pb-4 border-b-2 border-dashed border-gray-400">
          <div className="flex justify-between text-sm mb-2">
            <span>Sous-total:</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span>Livraison:</span>
            <span>{formatPrice(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold mt-2">
            <span>TOTAL:</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mb-4 pb-4 border-b border-dashed border-gray-400">
          <div className="flex justify-between text-sm">
            <span>Mode de paiement:</span>
            <span className="font-semibold">
              {order.paymentMethod === 'momo' ? 'MTN Mobile Money' :
               order.paymentMethod === 'om' ? 'Orange Money' :
               order.paymentMethod === 'cash' ? 'Espèces' : 'Carte bancaire'}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span>Statut paiement:</span>
            <span className={`font-semibold ${
              order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {order.paymentStatus === 'paid' ? 'PAYÉ' : 'EN ATTENTE'}
            </span>
          </div>
        </div>

        {/* Estimated Delivery */}
        {order.estimatedDeliveryTime && (
          <div className="mb-4 pb-4 border-b border-dashed border-gray-400">
            <div className="text-center">
              <p className="text-sm font-semibold">Livraison estimée:</p>
              <p className="text-sm">{formatDate(order.estimatedDeliveryTime)}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs mt-4">
          <p className="font-semibold mb-1">Merci pour votre commande!</p>
          <p>Bon appétit! 🌯</p>
          <p className="mt-2">www.houseofshawarma.com</p>
        </div>

        {/* Barcode placeholder */}
        <div className="text-center mt-4">
          <div className="inline-block px-4 py-2 bg-gray-100 font-mono text-xs">
            {order.orderNumber}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReceipt;
