// src/pages/Cart.jsx

import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const { cart, removeItem, clear, totalPrice, addItem, decreaseItem, totalQuantity } = useContext(CartContext);

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Tu carrito está vacío</h2>
        <p>¿No sabes qué comprar? ¡Miles de productos te esperan!</p>
        <Link to="/tienda" className="btn-gohome">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>Resumen de tu Compra</h2>
      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.cartItemId} className="cart-item">
            <img src={item.imagenUrl} alt={item.nombre} className="cart-item-image" />
            <div className="cart-item-details">
              <h3>{item.nombre}</h3>
              
              {/* --- INICIO DE LA MODIFICACIÓN --- */}
              {/* Verificamos si hay personalizaciones y las mostramos en una lista */}
              {item.customizations && item.customizations.length > 0 && (
                <ul className="cart-customizations-list">
                  {item.customizations.map((cust, index) => (
                    <li key={index}>
                      <strong>{cust.type}:</strong> {cust.value}
                    </li>
                  ))}
                </ul>
              )}
              {/* --- FIN DE LA MODIFICACIÓN --- */}

              <p>Precio unitario: S/ {item.precio.toFixed(2)}</p>
              
              <div className="quantity-controls">
                <button onClick={() => decreaseItem(item.cartItemId)} className="quantity-btn">-</button>
                <span>{item.quantity}</span>
                <button onClick={() => addItem(item, 1)} className="quantity-btn">+</button>
              </div>

            </div>
            <div className="cart-item-actions">
              <p className="cart-item-subtotal">Subtotal: S/ {(item.precio * item.quantity).toFixed(2)}</p>
              <button onClick={() => removeItem(item.cartItemId)} className="btn-remove">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h3>Total de la compra: S/ {totalPrice().toFixed(2)}</h3>
        <p>{totalQuantity()} productos en total</p>
        <div className="cart-summary-buttons">
          <button onClick={() => clear()} className="btn-clear-cart">
            Vaciar Carrito
          </button>
          <Link to="/checkout" className="btn-checkout">Finalizar Compra</Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;