// src/pages/admin/OrderList.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
// Importamos las funciones necesarias, incluyendo runTransaction
import { collection, getDocs, orderBy, query, doc, updateDoc, runTransaction } from 'firebase/firestore';
import toast from 'react-hot-toast';
import './OrderList.css';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const statusOptions = [
    { value: 'pending_payment', label: 'Pendiente de Pago' },
    { value: 'payment_in_review', label: 'Pago en Revisión' },
    { value: 'payment_verified', label: 'Pago Verificado' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'canceled', label: 'Cancelado' }
  ];

  const fetchOrders = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders: ", error);
        toast.error("No se pudo cargar los pedidos.");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleLocalStatusChange = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const handleSaveStatus = async (orderId, newStatus) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    // Si el nuevo estado es "Pago Verificado", ejecutamos la lógica para descontar stock.
    if (newStatus === 'payment_verified') {
      const promise = runTransaction(db, async (transaction) => {
        const orderRef = doc(db, 'orders', orderId);
        
        // Verificamos el stock de cada producto en la orden
        for (const item of orderToUpdate.items) {
          const productRef = doc(db, 'productos', item.id);
          const productDoc = await transaction.get(productRef);
          
          if (!productDoc.exists()) {
            throw new Error(`Producto ${item.nombre} no encontrado.`);
          }
          
          const currentStock = productDoc.data().stock;
          if (currentStock < item.quantity) {
            throw new Error(`Stock insuficiente para ${item.nombre}. Stock actual: ${currentStock}.`);
          }

          // Descontamos el stock
          const newStock = currentStock - item.quantity;
          transaction.update(productRef, { stock: newStock });
        }

        // Si todo el stock es suficiente, actualizamos el estado de la orden
        transaction.update(orderRef, { status: newStatus });
      });

      toast.promise(promise, {
        loading: 'Verificando stock y guardando...',
        success: '¡Stock actualizado y estado guardado!',
        error: (err) => `Error: ${err.message}`, // Muestra errores de stock insuficiente
      });

      // Actualizamos el estado en la UI solo si la transacción fue exitosa
       promise.then(() => {
        fetchOrders(); // Recarga las órdenes para reflejar los cambios de stock si es necesario
      }).catch(err => {
        console.error("Error en la transacción, se revirtieron los cambios:", err);
        fetchOrders(); // Vuelve a cargar los datos originales
      });

    } else {
      // Para cualquier otro estado, solo guardamos el cambio sin tocar el stock.
      const orderRef = doc(db, 'orders', orderId);
      const promise = updateDoc(orderRef, { status: newStatus });
      toast.promise(promise, {
         loading: 'Guardando...',
         success: '¡Estado guardado!',
         error: 'No se pudo guardar el estado.',
       });
    }
  };

  const toggleDetails = (orderId) => {
    setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
  };

  if (loading) return <p>Cargando pedidos...</p>;

  return (
    <div className="order-list-container">
      <h3>Pedidos Recibidos ({orders.length})</h3>
      <div className="order-list">
        <div className="order-list-header">
          <span>Pedido</span>
          <span>Cliente</span>
          <span>Total</span>
          <span>Comprobante</span>
          <span className="status-header">Estado</span>
          <span>Acciones</span>
        </div>
        <ul className="orders-ul">
          {orders.map(order => (
            <li key={order.id} className="order-list-item">
              <div className="order-item-summary">
                <div className="order-cell" data-label="Pedido">
                  <strong>#{order.id.substring(0, 7).toUpperCase()}</strong>
                  <small>{new Date(order.createdAt.seconds * 1000).toLocaleString()}</small>
                </div>
                <div className="order-cell" data-label="Cliente">
                  {order.customer.nombre} {order.customer.apellido}
                </div>
                <div className="order-cell" data-label="Total">
                  S/ {order.total.toFixed(2)}
                </div>
                <div className="order-cell" data-label="Comprobante">
                  {order.proofOfPaymentUrl ? (
                    <a href={order.proofOfPaymentUrl} target="_blank" rel="noopener noreferrer" className="proof-link-btn">
                      Ver Imagen
                    </a>
                  ) : 'N/A'}
                </div>
                <div className="order-cell status-cell" data-label="Estado">
                  <select 
                    value={order.status} 
                    onChange={(e) => handleLocalStatusChange(order.id, e.target.value)}
                    className="status-select"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => handleSaveStatus(order.id, order.status)}
                    className="save-status-btn"
                  >
                    Guardar
                  </button>
                </div>
                <div className="order-cell" data-label="Acciones">
                  <button onClick={() => toggleDetails(order.id)} className="details-btn-admin">
                    {expandedOrderId === order.id ? 'Ocultar' : 'Detalle'}
                  </button>
                </div>
              </div>

              {expandedOrderId === order.id && (
                <div className="order-item-details">
                  <div className="detail-section products-section">
                    <strong>Productos:</strong>
                    <ul>
                       {/* ***** INICIO DE LA MODIFICACIÓN ***** */}
                      {order.items.map((item, index) => (
                        <li key={`${item.id}-${index}`}>
                          <img src={item.imagenUrl} alt={item.nombre} />
                          <div>
                            <span>{item.quantity} x {item.nombre}</span>
                            {/* Si el item tiene personalización, la mostramos aquí */}
                            {item.customization && (
                              <div className="customization-detail">
                                <strong>Personalización:</strong> {item.customization.value}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                       {/* ***** FIN DE LA MODIFICACIÓN ***** */}
                    </ul>
                  </div>
                  <div className="detail-section customer-section">
                    <strong>Datos del Cliente:</strong>
                    <p><strong>DNI:</strong> {order.customer.dni}</p>
                    <p><strong>Teléfono:</strong> {order.customer.telefono}</p>
                    <p><strong>Dirección:</strong> {order.customer.direccion}, {order.customer.referencia}</p>
                    <p><strong>Ubicación:</strong> {order.customer.distrito} - {order.customer.provincia}</p>
                    <p><strong>Método de envío:</strong> {order.shipping.name}</p>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrderList;