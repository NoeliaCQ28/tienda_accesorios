// src/pages/ProductDetailPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const { addItem } = useContext(CartContext);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const productRef = doc(db, 'productos', productId);
                const docSnap = await getDoc(productRef);
                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() });
                } else {
                    toast.error("Producto no encontrado.");
                }
            } catch (error) {
                toast.error("Error al cargar el producto.");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const handleAddToCart = () => {
        if (!product) return;
        if (currentUser) {
            addItem(product, quantity);
            toast.success(`${quantity} x "${product.nombre}" añadido(s) al carrito.`);
        } else {
            toast.error("Debes iniciar sesión para añadir productos.");
            navigate('/login');
        }
    };

    if (loading) return <div className="detail-loading">Cargando producto...</div>;
    if (!product) return <div className="detail-loading">Producto no encontrado.</div>;

    return (
        <div className="product-detail-page">
            <div className="product-detail-layout">
                <div className="product-images">
                    <img src={product.imagenUrl} alt={product.nombre} className="main-image" />
                </div>

                <div className="product-info-section">
                    <h1 className="product-title">{product.nombre}</h1>
                    <p className="product-detail-price">S/ {product.precio.toFixed(2)}</p>
                    <p className="product-detail-description">{product.descripcion}</p>
                    
                    <div className="product-actions">
                        <div className="quantity-selector">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(q => q + 1)}>+</button>
                        </div>
                        <button className="add-to-cart-detail-btn" onClick={handleAddToCart}>
                            Añadir al Carrito
                        </button>
                    </div>

                    <div className="product-meta">
                        <span><strong>Stock:</strong> {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}</span>
                        <span><strong>Categorías:</strong> {product.tags.join(', ')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;