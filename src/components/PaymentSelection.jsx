import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

// --- INICIO DE LA MODIFICACIÓN ---
// 1. Importamos los datos de ubicación para poder buscar los nombres
import allDepartments from '../data/departamentos.json';
import allProvinces from '../data/provincias.json';
import allDistricts from '../data/distritos.json';
// --- FIN DE LA MODIFICACIÓN ---

// Tus importaciones de íconos
import yapeIcon from '../assets/yape-logo.png';
import plinIcon from '../assets/plin-logo.png';
import whatsappIcon from '../assets/whatsapp-logo.png';
import izipayIcon from '../assets/izipay-logo.png';

import './PaymentSelection.css';

// 2. El componente ahora recibe los IDs de la ubicación seleccionada desde CheckoutPage
const PaymentSelection = ({ customerData, shippingOption, cart, totalAmount, currentUser, departmentId, provinceId, districtId }) => {
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
      // --- INICIO DE LA MODIFICACIÓN ---
      // 3. Buscamos los nombres correspondientes a los IDs
      const departmentName = allDepartments.find(d => d.id_ubigeo === departmentId)?.nombre_ubigeo || '';
      const provinceName = allProvinces[departmentId]?.find(p => p.id_ubigeo === provinceId)?.nombre_ubigeo || '';
      const districtName = allDistricts[provinceId]?.find(d => d.id_ubigeo === districtId)?.nombre_ubigeo || '';
      // --- FIN DE LA MODIFICACIÓN ---

      const orderData = {
        customer: {
            ...customerData,
            uid: currentUser.uid, // Guardamos el UID del usuario
            email: currentUser.email,
            // --- INICIO DE LA MODIFICACIÓN ---
            // 4. Guardamos los nombres en el objeto del cliente dentro de la orden
            departamento: departmentName,
            provincia: provinceName,
            distrito: districtName,
            // --- FIN DE LA MODIFICACIÓN ---
        },
        shipping: shippingOption,
        items: cart,
        total: totalAmount,
        paymentMethod: selectedPayment.id,
        status: selectedPayment.id === 'whatsapp' ? 'pending_whatsapp' : 'pending_payment',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      
      toast.dismiss();
      await clearCart();

      if (selectedPayment.id === 'whatsapp') {
        const orderId = docRef.id.substring(0, 7).toUpperCase();
        const message = `¡Hola! Quiero coordinar el pago de mi pedido: #${orderId}`;
        const whatsappUrl = `https://wa.me/51987869687?text=${encodeURIComponent(message)}`;
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