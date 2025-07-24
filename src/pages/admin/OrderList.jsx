// src/pages/admin/OrderList.jsx - Con soporte para impresora térmica

import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, orderBy, query, doc, updateDoc, runTransaction } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Boleta } from '../../components/Boleta';
import './OrderList.css';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderToPrint, setOrderToPrint] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isPrintingThermal, setIsPrintingThermal] = useState(false);
  const [thermalPrinterStatus, setThermalPrinterStatus] = useState('unknown');
  const boletaRef = useRef();

  // URL del servidor Python local
  const THERMAL_PRINTER_SERVER = 'http://localhost:5000';

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

  // Verificar estado de la impresora térmica al cargar
  const checkThermalPrinterStatus = async () => {
    try {
      const response = await fetch(`${THERMAL_PRINTER_SERVER}/printer-status`);
      if (response.ok) {
        setThermalPrinterStatus('connected');
      } else {
        setThermalPrinterStatus('error');
      }
    } catch (error) {
      setThermalPrinterStatus('disconnected');
    }
  };

  useEffect(() => {
    fetchOrders();
    checkThermalPrinterStatus();
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

    if (newStatus === 'payment_verified') {
      const promise = runTransaction(db, async (transaction) => {
        const orderRef = doc(db, 'orders', orderId);
        
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

          const newStock = currentStock - item.quantity;
          transaction.update(productRef, { stock: newStock });
        }

        transaction.update(orderRef, { status: newStatus });
      });

      toast.promise(promise, {
        loading: 'Verificando stock y guardando...',
        success: '¡Stock actualizado y estado guardado!',
        error: (err) => `Error: ${err.message}`,
      });

      promise.then(() => {
        fetchOrders();
      }).catch(err => {
        console.error("Error en la transacción, se revirtieron los cambios:", err);
        fetchOrders();
      });

    } else {
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

  // Función para imprimir en impresora térmica
  const printOrderThermal = async (order) => {
    if (!order) {
      toast.error('No se pudo cargar la información de la orden');
      return;
    }

    setIsPrintingThermal(true);

    try {
      const response = await fetch(`${THERMAL_PRINTER_SERVER}/print-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('¡Boleta impresa en impresora térmica!');
      } else {
        toast.error(result.message || 'Error al imprimir en impresora térmica');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor de impresión:', error);
      toast.error('No se pudo conectar con la impresora térmica. ¿Está el servidor ejecutándose?');
    } finally {
      setIsPrintingThermal(false);
    }
  };

  // Función para impresión normal (navegador)
  const printOrder = (order) => {
    if (!order) {
      toast.error('No se pudo cargar la información de la orden');
      return;
    }

    setOrderToPrint(order);
    setIsPrinting(true);

    setTimeout(() => {
      if (boletaRef.current) {
        const printWindow = window.open('', '_blank');
        const boletaHTML = boletaRef.current.outerHTML;
        
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Boleta-${order.id.substring(0, 7).toUpperCase()}</title>
              <style>
                ${getBoletaStyles()}
              </style>
            </head>
            <body>
              ${boletaHTML}
            </body>
          </html>
        `);
        
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
          printWindow.onafterprint = () => {
            printWindow.close();
            setIsPrinting(false);
            setOrderToPrint(null);
            toast.success('Boleta impresa correctamente');
          };
        };
      } else {
        setIsPrinting(false);
        toast.error('Error: No se pudo preparar la boleta para imprimir');
      }
    }, 300);
  };

  // Función de prueba para impresora térmica
  const testThermalPrinter = async () => {
    try {
      toast.loading('Enviando recibo de prueba...');
      
      const response = await fetch(`${THERMAL_PRINTER_SERVER}/test-print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.dismiss();
        toast.success('¡Recibo de prueba impreso exitosamente!');
        setThermalPrinterStatus('connected');
      } else {
        toast.dismiss();
        toast.error(result.message || 'Error en la prueba de impresión');
        setThermalPrinterStatus('error');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('No se pudo conectar con la impresora térmica');
      setThermalPrinterStatus('disconnected');
    }
  };

  const getBoletaStyles = () => {
    return `
      .boleta-container {
        width: 794px;
        padding: 40px;
        font-family: 'Arial', sans-serif;
        color: #212529;
        background-color: white;
        box-sizing: border-box;
        line-height: 1.4;
      }
      .boleta-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #dee2e6;
        padding-bottom: 20px;
        margin-bottom: 30px;
      }
      .boleta-logo {
        max-width: 140px;
        max-height: 70px;
        object-fit: contain;
      }
      .store-info {
        text-align: right;
      }
      .store-info h2 {
        margin: 0;
        font-size: 26px;
        color: #000;
        font-weight: bold;
      }
      .store-info p {
        margin: 4px 0;
        font-size: 14px;
        color: #495057;
      }
      .boleta-info {
        display: flex;
        justify-content: space-between;
        margin: 30px 0;
        padding: 20px;
        background-color: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;
      }
      .customer-info, .order-meta-info {
        width: 48%;
      }
      .boleta-info h3 {
        margin-top: 0;
        margin-bottom: 12px;
        border-bottom: 1px solid #dee2e6;
        padding-bottom: 8px;
        font-size: 18px;
        color: #343a40;
        font-weight: bold;
      }
      .boleta-info p {
        font-size: 14px;
        line-height: 1.6;
        margin: 5px 0;
      }
      .boleta-items {
        margin-top: 30px;
      }
      .items-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #dee2e6;
      }
      .items-table th, .items-table td {
        padding: 12px 15px;
        border-bottom: 1px solid #dee2e6;
        text-align: left;
        vertical-align: top;
      }
      .items-table th {
        background-color: #e9ecef;
        font-weight: 600;
        font-size: 14px;
        color: #495057;
      }
      .items-table td {
        font-size: 14px;
      }
      .items-table td:first-child {
        text-align: center;
        width: 60px;
        font-weight: bold;
      }
      .items-table td:last-child {
        text-align: right;
        font-weight: 500;
        width: 120px;
      }
      .item-customization-print {
        font-size: 12px;
        color: #6c757d;
        padding-left: 15px;
        margin-top: 4px;
        line-height: 1.3;
      }
      .item-customization-print.text {
        font-style: italic;
      }
      .boleta-footer {
        margin-top: 40px;
        text-align: center;
        font-size: 14px;
        color: #6c757d;
        border-top: 1px solid #dee2e6;
        padding-top: 20px;
        font-style: italic;
      }
    `;
  };

  const getThermalPrinterStatusIcon = () => {
    switch (thermalPrinterStatus) {
      case 'connected':
        return '🟢';
      case 'error':
        return '🟡';
      case 'disconnected':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getThermalPrinterStatusText = () => {
    switch (thermalPrinterStatus) {
      case 'connected':
        return 'Conectada';
      case 'error':
        return 'Con errores';
      case 'disconnected':
        return 'Desconectada';
      default:
        return 'Verificando...';
    }
  };

  if (loading) return <p>Cargando pedidos...</p>;

  return (
    <div className="order-list-container">
      <div className="order-list-header-section">
        <h3>Pedidos Recibidos ({orders.length})</h3>
        
        {/* Estado de impresora térmica */}
        <div className="thermal-printer-status">
          <span className="printer-status-indicator">
            {getThermalPrinterStatusIcon()} Impresora Térmica: {getThermalPrinterStatusText()}
          </span>
          <button 
            onClick={testThermalPrinter}
            className="test-printer-btn"
            title="Probar impresora térmica"
          >
            🧪 Probar
          </button>
          <button 
            onClick={checkThermalPrinterStatus}
            className="refresh-status-btn"
            title="Actualizar estado"
          >
            🔄
          </button>
        </div>
      </div>

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
                <div className="order-cell actions-cell" data-label="Acciones">
                  <button onClick={() => toggleDetails(order.id)} className="details-btn-admin">
                    {expandedOrderId === order.id ? 'Ocultar' : 'Detalle'}
                  </button>
                  
                  {/* Botón impresión normal */}
                  <button 
                    onClick={() => printOrder(order)} 
                    className="print-btn"
                    disabled={isPrinting}
                    title="Imprimir Boleta Normal"
                  >
                    {isPrinting ? '⏳ Imprimiendo...' : '🖨️ Normal'}
                  </button>

                  {/* Botón impresión térmica */}
                  <button 
                    onClick={() => printOrderThermal(order)} 
                    className="print-thermal-btn"
                    disabled={isPrintingThermal || thermalPrinterStatus !== 'connected'}
                    title="Imprimir en Impresora Térmica"
                  >
                    {isPrintingThermal ? '⏳ Enviando...' : '🎫 Térmica'}
                  </button>
                </div>
              </div>

              {expandedOrderId === order.id && (
                <div className="order-item-details">
                  <div className="detail-section products-section">
                    <strong>Productos:</strong>
                    <ul>
                      {order.items.map((item, index) => (
                        <li key={`${item.id}-${index}`}>
                          <img src={item.imagenUrl} alt={item.nombre} />
                          <div>
                            <span>{item.quantity} x {item.nombre}</span>
                            {item.customization && item.customization.color && (
                              <div className="customization-detail">
                                <strong>Color:</strong> {item.customization.color.value}
                              </div>
                            )}
                            {item.customization && item.customization.text && (
                              <div className="customization-detail text">
                                <strong>Texto:</strong> "{item.customization.text.value}"
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
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

      {/* Componente de boleta oculto para impresión normal */}
      {orderToPrint && (
        <div style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: '-9999px',
          visibility: 'hidden'
        }}>
          <Boleta ref={boletaRef} order={orderToPrint} />
        </div>
      )}

      {/* Overlay de impresión */}
      {isPrinting && (
        <div className="printing-overlay">
          <div className="printing-message">
            <p>⏳ Preparando boleta para imprimir...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;