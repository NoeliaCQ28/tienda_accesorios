// src/pages/Cart.jsx

import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import './Cart.css'; // Asegúrate de que los estilos estén importados

const Cart = () => {
  // Obtenemos las funciones y el estado del contexto del carrito
  const { cart, removeItem, clear, totalPrice, addItem, decreaseItem, totalQuantity } = useContext(CartContext);

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
          // Usamos el cartItemId que es único para cada producto, incluyendo su personalización
          <div key={item.cartItemId} className="cart-item">
            <img src={item.imagenUrl} alt={item.nombre} className="cart-item-image" />
            <div className="cart-item-details">
              <h3>{item.nombre}</h3>
              
              {/* --- INICIO DE LA MODIFICACIÓN --- */}
              {/* Muestra el color si existe */}
              {item.customization && item.customization.color && (
                <p className="cart-item-customization">
                  Color: {item.customization.color.value}
                </p>
              )}

              {/* Muestra el texto personalizado si existe */}
              {item.customization && item.customization.text && (
                <p className="cart-item-customization text">
                  Texto: "{item.customization.text.value}"
                </p>
              )}
              {/* --- FIN DE LA MODIFICACIÓN --- */}

              <p>Precio unitario: S/ {item.precio.toFixed(2)}</p>
              
              <div className="quantity-controls">
                {/* Pasamos el cartItemId único a las funciones */}
                <button onClick={() => decreaseItem(item.cartItemId)} className="quantity-btn">-</button>
                <span>{item.quantity}</span>
                <button onClick={() => addItem(item, 1)} className="quantity-btn">+</button>
              </div>

            </div>
            <div className="cart-item-actions">
              <p className="cart-item-subtotal">Subtotal: S/ {(item.precio * item.quantity).toFixed(2)}</p>
              {/* Pasamos el cartItemId único a la función de remover */}
              <button onClick={() => removeItem(item.cartItemId)} className="btn-remove">
                Eliminar todo
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