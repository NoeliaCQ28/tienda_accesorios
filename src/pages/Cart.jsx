// src/pages/Cart.jsx - Con controles de cantidad

import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  // Obtenemos las nuevas funciones del contexto
  const { cart, removeItem, clear, totalPrice, addItem, decreaseItem } = useContext(CartContext);

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Tu carrito está vacío</h2>
        <p>¿No sabes qué comprar? ¡Miles de productos te esperan!</p>
        <Link to="/" className="btn-gohome">
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
          <div key={item.id} className="cart-item">
            <img src={item.imagenUrl} alt={item.nombre} className="cart-item-image" />
            <div className="cart-item-details">
              <h3>{item.nombre}</h3>
              <p>Precio unitario: S/ {item.precio.toFixed(2)}</p>
              
              {/* --- ¡NUEVOS CONTROLES DE CANTIDAD! --- */}
              <div className="quantity-controls">
                <button onClick={() => decreaseItem(item.id)} className="quantity-btn">-</button>
                <span>{item.quantity}</span>
                <button onClick={() => addItem(item, 1)} className="quantity-btn">+</button>
              </div>

            </div>
            <div className="cart-item-actions">
              <p className="cart-item-subtotal">Subtotal: S/ {(item.precio * item.quantity).toFixed(2)}</p>
              <button onClick={() => removeItem(item.id)} className="btn-remove">
                Eliminar todo
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h3>Total de la compra: S/ {totalPrice().toFixed(2)}</h3>
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