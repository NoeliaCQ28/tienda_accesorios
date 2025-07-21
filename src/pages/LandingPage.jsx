// src/pages/LandingPage.jsx - Versión Completa y Final

import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css'; // Estilos para esta página
import '../App.css';       // Reutilizamos los estilos de las tarjetas de producto

const LandingPage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useContext(CartContext);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // --- Datos de ejemplo para las reseñas ---
  const testimonials = [
    {
      id: 1,
      name: 'Ana P.',
      quote: '¡Me encantó la pulsera! La calidad es increíble y el diseño es único. ¡Llegó súper rápido!',
      stars: 5,
    },
    {
      id: 2,
      name: 'Carlos G.',
      quote: 'El collar que compré fue el regalo perfecto. La atención al detalle es impresionante. Muy recomendado.',
      stars: 5,
    },
    {
      id: 3,
      name: 'Sofía L.',
      quote: 'Hermosos accesorios, se nota que están hechos con mucho amor y dedicación. Ya quiero mi próximo pedido.',
      stars: 4,
    },
  ];

  // --- useEffect para obtener los productos destacados de Firestore ---
  useEffect(() => {
    const getFeaturedProducts = async () => {
      setLoading(true);
      try {
        const productsCollection = collection(db, 'productos');
        const featuredQuery = query(
          productsCollection, 
          where("tags", "array-contains", "destacado"), 
          limit(4)
        );
        
        const querySnapshot = await getDocs(featuredQuery);
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFeaturedProducts(productsData);
      } catch (error) {
        console.error("Error al obtener productos destacados:", error);
      }
      setLoading(false);
    };

    getFeaturedProducts();
  }, []);

  // --- Función para añadir al carrito (con verificación de login) ---
  const handleAddToCart = (producto) => {
    if (currentUser) {
      addItem(producto, 1);
      alert(`"${producto.nombre}" fue añadido al carrito.`);
    } else {
      alert("Debes iniciar sesión para añadir productos al carrito.");
      navigate('/login');
    }
  };

  return (
    <div className="landing-page">
      {/* SECCIÓN 1: CARRUSEL / HÉROE */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Hecho a Mano, Lleno de Amor</h1>
          <p>Descubre accesorios únicos que cuentan tu historia.</p>
          <Link to="/tienda" className="hero-button">Explorar la Tienda</Link>
        </div>
      </section>

      {/* SECCIÓN 2: PRODUCTOS DESTACADOS */}
      <section className="featured-products-section">
        <h2>Nuestros Favoritos</h2>
        <div className="product-grid">
          {loading ? <p>Cargando...</p> : featuredProducts.map(producto => (
            <article key={producto.id} className="product-card">
              <img src={producto.imagenUrl} alt={producto.nombre} className="product-image" />
              <div className="product-info">
                <h3>{producto.nombre}</h3>
                <p className="product-description">{producto.descripcion}</p>
                <div className="product-footer">
                  <p className="price">S/ {producto.precio.toFixed(2)}</p>
                  <button className="add-to-cart-btn" onClick={() => handleAddToCart(producto)}>
                    Agregar al Carrito
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECCIÓN 3: SOBRE NOSOTROS */}
      <section className="about-us-section">
        <div className="about-us-content">
          <h2>Sobre Accesorios Liath</h2>
          <p>
            Somos un pequeño emprendimiento nacido de la pasión por crear con las manos. Cada pieza es diseñada y elaborada con dedicación, pensando en los pequeños detalles que te hacen sonreír. Creemos en la belleza de lo artesanal y en el valor de un accesorio que te representa.
          </p>
        </div>
      </section>

      {/* SECCIÓN 4: RESEÑAS / TESTIMONIOS */}
      <section className="testimonials-section">
        <h2>Lo que dicen nuestros clientes</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <p className="testimonial-quote">"{testimonial.quote}"</p>
              <div className="testimonial-rating">
                {'★'.repeat(testimonial.stars)}
                {'☆'.repeat(5 - testimonial.stars)}
              </div>
              <p className="testimonial-author">- {testimonial.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;