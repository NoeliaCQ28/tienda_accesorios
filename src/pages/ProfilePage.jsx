// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import './ProfilePage.css';
import OrderStatusTimeline from '../components/OrderStatusTimeline';
// Función para mostrar instrucciones según el estado del pedido
function getOrderInstructions(status) {
  switch (status) {
    case 'pending_payment':
      return 'Por favor, sube tu comprobante de pago desde la página de confirmación de pedido.';
    case 'payment_in_review':
      return 'Estamos revisando tu comprobante de pago. Te avisaremos pronto.';
    case 'payment_verified':
      return '¡Pago verificado! Pronto enviaremos tu pedido.';
    case 'shipped':
      return 'Tu pedido ha sido enviado. Pronto recibirás información de seguimiento.';
    case 'delivered':
      return '¡Pedido entregado! Gracias por tu compra.';
    case 'canceled':
      return 'Este pedido fue cancelado por el administrador.';
    default:
      return '';
  }
}

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- ¡NUEVO! Estado para controlar qué pedido está expandido ---
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser?.email) return;
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef, 
          where("customer.email", "==", currentUser.email),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const userOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(userOrders);
      } catch (error) {
        console.error("Error al obtener las órdenes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentUser]);

  // --- ¡NUEVO! Función para expandir o colapsar el detalle de un pedido ---
  const handleToggleDetails = (orderId) => {
    setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
  };

  // Funciones para el estilo del estado (sin cambios)
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending_payment': return 'status-pending';
      case 'payment_in_review': return 'status-review';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'canceled': return 'status-canceled';
      default: return '';
    }
  };
  const getStatusText = (status) => {
    switch (status) {
        case 'pending_payment': return 'Pendiente de Pago';
        case 'payment_in_review': return 'Pago en Revisión';
        case 'shipped': return 'Enviado';
        case 'delivered': return 'Entregado';
        case 'canceled': return 'Cancelado';
        default: return 'Desconocido';
      }
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2>Mi Cuenta</h2>
        <p>Aquí puedes ver la información de tu perfil y el historial de tus pedidos.</p>
      </div>

      <div className="profile-content">
        <div className="profile-details card">
          <h3>Detalles del Perfil</h3>
          <p><strong>Email:</strong> {currentUser?.email}</p>
          {/* Puedes añadir más detalles del perfil aquí si los guardas */}
        </div>

        <div className="profile-orders card">
          <h3>Mis Pedidos</h3>
          {loading ? (
            <p>Cargando tus pedidos...</p>
          ) : orders.length > 0 ? (
            <ul className="orders-list">
              {orders.map(order => (
                <li key={order.id} className="order-item-container">
                  <div className="order-item">
                    <div className="order-info">
                      <span className="order-id">Pedido: #{order.id.substring(0, 8).toUpperCase()}</span>
                      <span className="order-date">
                        {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="order-summary">
                      <span className="order-total">S/ {order.total.toFixed(2)}</span>
                      <span className={`order-status ${getStatusClass(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    {/* --- ¡NUEVO! Botón para ver detalles --- */}
                    <button onClick={() => handleToggleDetails(order.id)} className="details-btn">
                      {expandedOrderId === order.id ? 'Ocultar' : 'Ver Detalle'}
                    </button>
                  </div>
                  
                  {/* --- ¡NUEVO! Sección de detalles que se expande --- */}
                  {expandedOrderId === order.id && (
                    <div className="order-details-view">
                      <OrderStatusTimeline status={order.status} />
                      <p className="order-instructions">{getOrderInstructions(order.status)}</p>
                      <h4>Productos del Pedido:</h4>
                      <ul className="product-details-list">
                        {order.items.map(item => (
                          <li key={item.id} className="product-detail-item">
                            <img src={item.imagenUrl} alt={item.nombre} className="product-thumbnail" />
                            <div className="product-info">
                              <span>{item.nombre}</span>
                              <span className="product-qty">Cantidad: {item.quantity}</span>
                            </div>
                            <span className="product-price">S/ {(item.precio * item.quantity).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="shipping-details">
                        <h4>Detalles de Envío:</h4>
                        <p><strong>Dirección:</strong> {order.customer.direccion}, {order.customer.distrito} - {order.customer.provincia}</p>
                        <p><strong>Método:</strong> {order.shipping.name}</p>
                      </div>
                      {order.proofOfPaymentUrl && (
                        <div className="proof-link">
                          <a href={order.proofOfPaymentUrl} target="_blank" rel="noopener noreferrer">Ver comprobante de pago</a>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>Aún no has realizado ningún pedido.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;