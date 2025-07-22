// src/pages/ProductDetailPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

// 1. Importa el nuevo componente de selección de color
import ProductColorSelector from '../components/ProductColorSelector';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const { addItem } = useContext(CartContext);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    
    // 2. Añade un estado para el color seleccionado
    const [selectedColor, setSelectedColor] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                // ***** CORRECCIÓN AQUÍ *****
                // Cambiamos 'products' por 'productos' para que coincida con tu base de datos
                const productRef = doc(db, 'productos', productId);
                const docSnap = await getDoc(productRef);

                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.log("No such document!"); // Esto causaba el error en la consola
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
        
        // 3. Verifica si se requiere personalización y si se ha completado
        const isBracelet = product.tags && product.tags.includes('pulseras');
        if (isBracelet && !selectedColor) {
            toast.error("Por favor, selecciona un color para personalizar tu pulsera.");
            return;
        }

        if (currentUser) {
            // 4. Añade la información del color al producto antes de enviarlo al carrito
            const productToAdd = {
              ...product,
              // Añadimos un objeto 'customization' si se seleccionó un color
              customization: selectedColor ? {
                type: 'Color',
                value: selectedColor.name,
                color: selectedColor.color,
              } : null,
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
    
    // Lógica para deshabilitar el botón de añadir si es pulsera y no se ha elegido color
    const isBracelet = product.tags && product.tags.includes('pulseras');
    const isAddToCartDisabled = isBracelet && !selectedColor;

    return (
        <div className="product-detail-page">
            <div className="product-detail-layout">
                <div className="product-images">
                    <img src={product.imagenUrl} alt={product.nombre} className="main-image" />
                    {/* Muestra una vista previa del color seleccionado */}
                    {selectedColor && (
                        <div style={{marginTop: '1rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem'}}>
                            <p style={{margin: 0, fontWeight: 'bold'}}>Color:</p>
                            <div 
                                style={{ 
                                    width: '24px', 
                                    height: '24px', 
                                    borderRadius: '50%', 
                                    background: selectedColor.color,
                                    border: selectedColor.color === '#FFFFFF' ? '1px solid #ddd' : 'none' 
                                }}
                            />
                            <span>{selectedColor.name}</span>
                        </div>
                    )}
                </div>

                <div className="product-info-section">
                    <h1 className="product-title">{product.nombre}</h1>
                    <p className="product-detail-price">S/ {product.precio.toFixed(2)}</p>
                    <p className="product-detail-description">{product.descripcion}</p>
                    
                    {/* 5. Renderiza el componente selector de color si es una pulsera */}
                    {isBracelet && (
                        <ProductColorSelector product={product} onColorChange={setSelectedColor} />
                    )}
                    
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
                            {isAddToCartDisabled ? 'Elige un color' : 'Añadir al Carrito'}
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