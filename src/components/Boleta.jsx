// src/components/Boleta.jsx

import React from 'react';
import './Boleta.css'; // Crearemos este archivo de estilos a continuación
import logo from '../assets/logo.png'; // Asegúrate de que tu logo esté en src/assets/logo.png

export const Boleta = React.forwardRef(({ order }, ref) => {
  if (!order) {
    return null; // No renderizar nada si no hay una orden para imprimir
  }

  return (
    <div ref={ref} className="boleta-container">
      <header className="boleta-header">
        <img src={logo} alt="Logo Accesorios Liath" className="boleta-logo" />
        <div className="store-info">
          <h2>Accesorios Liath</h2>
          <p>accesoriosliath@gmail.com</p>
          <p>+51 987 869 687</p>
        </div>
      </header>

      <section className="boleta-info">
        <div className="customer-info">
          <h3>Cliente</h3>
          <p><strong>Nombre:</strong> {order.customer.nombre} {order.customer.apellido}</p>
          <p><strong>Dirección:</strong> {order.customer.direccion}</p>
          <p><strong>Ubicación:</strong> {order.customer.distrito} - {order.customer.provincia} - {order.customer.departamento}</p>
          <p><strong>Teléfono:</strong> {order.customer.telefono}</p>
        </div>
        <div className="order-meta-info">
          <h3>Pedido</h3>
          <p><strong>ID del Pedido:</strong> #{order.id.substring(0, 7).toUpperCase()}</p>
          <p><strong>Fecha:</strong> {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</p>
          <p><strong>Total:</strong> S/ {order.total.toFixed(2)}</p>
        </div>
      </section>

      <section className="boleta-items">
        <h3>Detalle del Pedido</h3>
        <table className="items-table">
          <thead>
            <tr>
              <th>Cant.</th>
              <th>Producto y Personalización</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index}>
                <td>{item.quantity}</td>
                <td>
                  {item.nombre}
                  {item.customization?.color && (
                    <div className="item-customization-print">
                      <strong>Color:</strong> {item.customization.color.value}
                    </div>
                  )}
                  {item.customization?.text && (
                    <div className="item-customization-print text">
                      <strong>Texto:</strong> "{item.customization.text.value}"
                    </div>
                  )}
                </td>
                <td>S/ {(item.precio * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="boleta-footer">
        <p>¡Gracias por tu compra! Síguenos en @accesorios.liath</p>
      </footer>
    </div>
  );
});
