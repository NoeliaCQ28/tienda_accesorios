import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

// Tus importaciones de íconos
import yapeIcon from '../assets/yape-logo.png';
import plinIcon from '../assets/plin-logo.png';
import whatsappIcon from '../assets/whatsapp-logo.png';
import izipayIcon from '../assets/izipay-logo.png';

import './PaymentSelection.css';

const PaymentSelection = ({ customerData, shippingOption, cart, totalAmount, currentUser }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { clear: clearCart } = useCart();

  const paymentOptions = [
    { id: 'yape', name: 'Yape', icon: yapeIcon, details: 'Paga con Yape y adjunta tu comprobante.' },
    { id: 'plin', name: 'Plin', icon: plinIcon, details: 'Usa Plin para un pago rápido y seguro.' },
    { id: 'whatsapp', name: 'Coordinar por WhatsApp', icon: whatsappIcon, details: 'Finaliza tu compra hablando con nosotros.' },
    { id: 'izipay', name: 'Tarjeta de Crédito/Débito', icon: izipayIcon, details: 'Próximamente con IziPay.' }
  ];

  const handleFinalSubmit = async () => {
    if (!selectedPayment) {
      toast.error("Por favor, selecciona un método de pago.");
      return;
    }
    if (selectedPayment.id === 'izipay') {
        toast.error("Este método de pago aún no está disponible. Por favor, elige otro.");
        return;
    }

    setIsProcessing(true);
    toast.loading('Procesando tu pedido...');

    try {
      const orderData = {
        customer: {
            ...customerData,
            email: currentUser.email
        },
        shipping: shippingOption,
        items: cart,
        total: totalAmount,
        paymentMethod: selectedPayment.id,
        status: selectedPayment.id === 'whatsapp' ? 'pending_whatsapp' : 'pending_payment',
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      const orderId = docRef.id.substring(0, 7).toUpperCase();
      
      toast.dismiss();
      clearCart();

      if (selectedPayment.id === 'whatsapp') {
        const message = `¡Hola! Quiero coordinar el pago de mi pedido: #${orderId}`;
        
        // --- ¡CAMBIO CLAVE AQUÍ! ---
        // Usamos el formato de enlace wa.me que es más moderno y fiable.
        const whatsappUrl = `https://wa.me/51987869687?text=${encodeURIComponent(message)}`; // Reemplaza con tu número
        
        window.open(whatsappUrl, '_blank');
        
        navigate('/cuenta');
        toast.success("Te hemos redirigido a WhatsApp. ¡Tu pedido ha sido guardado!");
      } else {
        navigate(`/order-confirmation/${docRef.id}`);
      }

    } catch (error) {
      toast.dismiss();
      toast.error('Hubo un error al crear tu pedido.');
      console.error("Error al guardar la orden: ", error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-selection-container">
      <h2>Elige tu método de pago</h2>
      <div className="payment-options-grid">
        {paymentOptions.map(option => (
          <div 
            key={option.id}
            className={`payment-option-card ${selectedPayment?.id === option.id ? 'selected' : ''}`}
            onClick={() => setSelectedPayment(option)}
          >
            <img src={option.icon} alt={`${option.name} logo`} className="payment-icon" />
            <div className="payment-details">
              <strong>{option.name}</strong>
              <p>{option.details}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedPayment?.id === 'yape' && (
        <div className="payment-instructions">
          <p>Al finalizar, te mostraremos nuestro QR e información para completar tu pago con <strong>Yape</strong>.</p>
        </div>
      )}
      {selectedPayment?.id === 'plin' && (
         <div className="payment-instructions">
            <p>Al finalizar, te mostraremos la información para completar tu pago con <strong>Plin</strong>.</p>
        </div>
      )}
       {selectedPayment?.id === 'whatsapp' && (
         <div className="payment-instructions">
            <p>Se guardará tu pedido y te redirigiremos a WhatsApp para coordinar el pago directamente con nosotros.</p>
        </div>
      )}
      
      <button 
        className="submit-order-btn" 
        onClick={handleFinalSubmit}
        disabled={isProcessing}
      >
        {isProcessing ? 'Procesando...' : `Finalizar Pedido - S/ ${totalAmount.toFixed(2)}`}
      </button>
    </div>
  );
};

export default PaymentSelection;