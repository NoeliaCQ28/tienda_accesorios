// src/pages/ProductDetailPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';
import ProductColorSelector from '../components/ProductColorSelector';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const { addItem } = useCart();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    
    // --- INICIO DE LA MODIFICACIÓN ---
    // 1. El estado `selectedColor` ahora puede ser:
    //    null: Aún no se ha decidido nada.
    //    'original': El cliente ha confirmado que quiere los colores por defecto.
    //    {objeto}: El cliente ha elegido un color específico.
    const [selectedColor, setSelectedColor] = useState(null);
    const [customText, setCustomText] = useState("");
    // --- FIN DE LA MODIFICACIÓN ---

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
        
        const isBracelet = product.tags && product.tags.includes('pulseras');
        if (isBracelet && selectedColor === null) {
            toast.error("Por favor, elige una opción de color para continuar.");
            return;
        }

        if (currentUser) {
            const colorCustomization = selectedColor && selectedColor !== 'original' ? {
                type: 'Color',
                value: selectedColor.name,
                color: selectedColor.color,
            } : null;

            const textCustomization = product.customizable && customText.trim() ? {
                type: 'Texto',
                value: customText.trim(),
            } : null;

            const productToAdd = {
              ...product,
              quantity,
              customization: {
                color: colorCustomization,
                text: textCustomization,
              }
            };

            addItem(productToAdd, quantity);
            toast.success(`${quantity} x "${product.nombre}" añadido(s) al carrito.`);
        } else {
            toast.error("Debes iniciar sesión para añadir productos.");
            navigate('/login');
        }
    };

    if (loading) return <div className="detail-loading">Cargando producto...</div>;
    if (!product) return <div className="detail-loading">Producto no encontrado.</div>;
    
    const isBracelet = product.tags && product.tags.includes('pulseras');
    // 2. Lógica corregida: el botón SÓLO se deshabilita si es una pulsera y no se ha tomado ninguna decisión (selectedColor es null).
    const isAddToCartDisabled = isBracelet && selectedColor === null;

    return (
        <div className="product-detail-page">
            <div className="product-detail-layout">
                <div className="product-images">
                    <img src={product.imagenUrl} alt={product.nombre} className="main-image" />
                    {selectedColor && typeof selectedColor === 'object' && (
                         <div className="color-preview-container">
                            <p className="color-preview-text">Color:</p>
                            <div 
                                className="color-preview-dot"
                                style={{ background: selectedColor.color, border: selectedColor.color === '#FFFFFF' ? '1px solid #ddd' : 'none' }}
                            />
                            <span>{selectedColor.name}</span>
                        </div>
                    )}
                </div>

                <div className="product-info-section">
                    <h1 className="product-title">{product.nombre}</h1>
                    <p className="product-detail-price">S/ {product.precio.toFixed(2)}</p>
                    <p className="product-detail-description">{product.descripcion}</p>
                    
                    <div className="customization-container">
                        {isBracelet && (
                            <ProductColorSelector product={product} onColorChange={setSelectedColor} />
                        )}

                        {product.customizable && (
                            <div className="text-customization-container">
                                <label htmlFor="customText">Añade tu texto (opcional):</label>
                                <input
                                    type="text"
                                    id="customText"
                                    placeholder="Ej: J❤️L"
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    maxLength={product.customizationMaxLength}
                                    className="custom-text-input"
                                />
                                <small className="char-counter">
                                    {customText.length} / {product.customizationMaxLength} caracteres
                                </small>
                            </div>
                        )}
                    </div>
                    
                    <div className="product-actions">
                        <div className="quantity-selector">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(q => q + 1)}>+</button>
                        </div>
                        <button 
                            className="add-to-cart-detail-btn" 
                            onClick={handleAddToCart}
                            disabled={isAddToCartDisabled}
                        >
                            {/* 3. El texto del botón ahora es más genérico cuando está deshabilitado. */}
                            {isAddToCartDisabled ? 'Elige una opción' : 'Añadir al Carrito'}
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