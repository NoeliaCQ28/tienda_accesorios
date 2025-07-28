// src/pages/admin/OrderList.jsx

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

  // --- INICIO DE LA MODIFICACIÓN CLAVE ---
  const handleSaveStatus = async (orderId, newStatus) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    // Si el estado es 'Pago Verificado', ejecutamos la transacción para descontar stock.
    if (newStatus === 'payment_verified') {
      const promise = runTransaction(db, async (transaction) => {
        const orderRef = doc(db, 'orders', orderId);
        
        // 1. FASE DE LECTURA: Leemos el stock de TODOS los productos primero.
        const productRefs = orderToUpdate.items.map(item => doc(db, 'productos', item.id));
        const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));
        
        const updates = [];

        // 2. FASE DE VALIDACIÓN Y CÁLCULO (aún sin escrituras)
        for (let i = 0; i < orderToUpdate.items.length; i++) {
          const item = orderToUpdate.items[i];
          const productDoc = productDocs[i];

          if (!productDoc.exists()) {
            throw new Error(`Producto "${item.nombre}" no encontrado en la base de datos.`);
          }
          
          const currentStock = productDoc.data().stock;
          if (currentStock < item.quantity) {
            throw new Error(`Stock insuficiente para "${item.nombre}". Stock actual: ${currentStock}, se necesitan: ${item.quantity}.`);
          }

          const newStock = currentStock - item.quantity;
          updates.push({ ref: productRefs[i], newStock: newStock });
        }

        // 3. FASE DE ESCRITURA: Si todo lo anterior pasó, ahora sí escribimos en la BD.
        updates.forEach(update => {
          transaction.update(update.ref, { stock: update.newStock });
        });
        
        // Finalmente, actualizamos el estado de la orden.
        transaction.update(orderRef, { status: newStatus });
      });

      toast.promise(promise, {
        loading: 'Verificando stock y guardando...',
        success: '¡Stock actualizado y estado guardado!',
        error: (err) => `Error en la transacción: ${err.message}`,
      });

      promise.then(() => {
        fetchOrders(); // Recargamos las órdenes para reflejar el cambio.
      }).catch(err => {
        console.error("La transacción falló y se revirtió:", err);
        fetchOrders(); // Recargamos para revertir cualquier cambio visual.
      });

    } else {
      // Para cualquier otro cambio de estado, hacemos una actualización simple.
      const orderRef = doc(db, 'orders', orderId);
      const promise = updateDoc(orderRef, { status: newStatus });
      toast.promise(promise, {
         loading: 'Guardando...',
         success: '¡Estado guardado!',
         error: 'No se pudo guardar el estado.',
       });
    }
  };
  // --- FIN DE LA MODIFICACIÓN CLAVE ---

  const toggleDetails = (orderId) => {
    setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
  };
  
  const printOrderThermal = async (order) => {
    if (!order) {
      toast.error('No se pudo cargar la información de la orden');
      return;
    }
    setIsPrintingThermal(true);
    try {
      const response = await fetch(`${THERMAL_PRINTER_SERVER}/print-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      toast.error('No se pudo conectar con la impresora térmica.');
    } finally {
      setIsPrintingThermal(false);
    }
  };

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
        printWindow.document.write(`<!DOCTYPE html><html><head><title>Boleta-${order.id.substring(0, 7).toUpperCase()}</title><style>${getBoletaStyles()}</style></head><body>${boletaHTML}</body></html>`);
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

  const testThermalPrinter = async () => {
    try {
      toast.loading('Enviando recibo de prueba...');
      const response = await fetch(`${THERMAL_PRINTER_SERVER}/test-print`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const result = await response.json();
      toast.dismiss();
      if (response.ok && result.success) {
        toast.success('¡Recibo de prueba impreso exitosamente!');
        setThermalPrinterStatus('connected');
      } else {
        toast.error(result.message || 'Error en la prueba de impresión');
        setThermalPrinterStatus('error');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('No se pudo conectar con la impresora térmica');
      setThermalPrinterStatus('disconnected');
    }
  };

  const getBoletaStyles = () => `...`; // (Se mantiene igual)
  const getThermalPrinterStatusIcon = () => { switch (thermalPrinterStatus) { case 'connected': return '🟢'; case 'error': return '🟡'; case 'disconnected': return '🔴'; default: return '⚪'; } };
  const getThermalPrinterStatusText = () => { switch (thermalPrinterStatus) { case 'connected': return 'Conectada'; case 'error': return 'Con errores'; case 'disconnected': return 'Desconectada'; default: return 'Verificando...'; } };

  if (loading) return <p>Cargando pedidos...</p>;

  return (
    <div className="order-list-container">
      <div className="order-list-header-section">
        <h3>Pedidos Recibidos ({orders.length})</h3>
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
            <span>Pedido</span><span>Cliente</span><span>Total</span><span>Comprobante</span><span className="status-header">Estado</span><span>Acciones</span>
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
                  <button onClick={() => printOrder(order)} className="print-btn" disabled={isPrinting} title="Imprimir Boleta Normal">
                    {isPrinting ? '⏳ Imprimiendo...' : '🖨️ Normal'}
                  </button>
                  <button onClick={() => printOrderThermal(order)} className="print-thermal-btn" disabled={isPrintingThermal || thermalPrinterStatus !== 'connected'} title="Imprimir en Impresora Térmica">
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
                            {item.customizations && item.customizations.length > 0 && (
                              <div className="customizations-display">
                                {item.customizations.map((cust, custIndex) => (
                                  <div key={custIndex} className="customization-detail">
                                    <strong>{cust.type}:</strong> {cust.value}
                                  </div>
                                ))}
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

      {orderToPrint && ( <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden' }}><Boleta ref={boletaRef} order={orderToPrint} /></div> )}
      {isPrinting && ( <div className="printing-overlay"><div className="printing-message"><p>⏳ Preparando boleta para imprimir...</p></div></div> )}
    </div>
  );
};

export default OrderList;