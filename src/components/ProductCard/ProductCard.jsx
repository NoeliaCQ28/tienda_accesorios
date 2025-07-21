import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import toast from 'react-hot-toast';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useContext(CartContext);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Helper para evitar que los clics en botones activen el link
  const handleInteraction = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleIncrement = (e) => {
    handleInteraction(e);
    if (quantity < product.stock) {
      setQuantity(prevQuantity => prevQuantity + 1);
    } else {
      toast.error(`Solo quedan ${product.stock} unidades en stock.`);
    }
  };

  const handleDecrement = (e) => {
    handleInteraction(e);
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  const handleAddToCart = (e) => {
    handleInteraction(e);
    if (currentUser) {
      addItem(product, quantity);
      toast.success(`${quantity} x "${product.nombre}" añadido(s) al carrito.`);
    } else {
      toast.error("Debes iniciar sesión para añadir productos al carrito.");
      navigate('/login');
    }
  };

  return (
    <Link to={`/producto/${product.id}`} className="product-card-link">
      <article className="product-card">
        <img src={product.imagenUrl} alt={product.nombre} className="product-image" />
        <div className="product-info">
          <h3>{product.nombre}</h3>
          <p className="product-description">{product.descripcion}</p>
          
          <div className="product-purchase-section">
            <p className="price">S/ {product.precio.toFixed(2)}</p>
            
            {/* Agrupamos el contador y el botón para un mejor control */}
            <div className="card-actions">
              <div className="quantity-selector">
                <button onClick={handleDecrement} className="quantity-btn">-</button>
                <span className="quantity-display">{quantity}</span>
                <button onClick={handleIncrement} className="quantity-btn">+</button>
              </div>
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                Añadir
              </button>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ProductCard;