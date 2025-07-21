// src/components/CartWidget.jsx - VERIFICACIÓN

import React, { useContext } from 'react';
import { Link } from 'react-router-dom'; // <-- ¿Está este import?
import { CartContext } from '../context/CartContext';
import './CartWidget.css';

const CartWidget = () => {
  const { totalQuantity } = useContext(CartContext);

  return (
    // ¿Está envuelto en este Link?
    <Link to="/cart" className="cart-widget">
      <span>🛒</span>
      {totalQuantity() > 0 && <span className="badge">{totalQuantity()}</span>}
    </Link>
  );
};

export default CartWidget;