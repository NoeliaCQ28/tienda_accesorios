// src/pages/ProductDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';
import ProductColorSelector from '../components/ProductColorSelector';
import ProductOptionSelector from '../components/ProductOptionSelector';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const { addItem } = useCart();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    
    // --- ESTADOS PARA CADA TIPO DE PERSONALIZACIÓN ---
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({});
    // --- MODIFICADO: Estado para el texto ahora es un objeto ---
    const [customizationsText, setCustomizationsText] = useState({});
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const productRef = doc(db, 'productos', productId);
                const docSnap = await getDoc(productRef);
                if (docSnap.exists()) {
                    const productData = { id: docSnap.id, ...docSnap.data() };
                    setProduct(productData);
                    setTotalPrice(productData.precioBase || 0);
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

    useEffect(() => {
        if (!product) return;
        const newTotal = selectedMaterial?.precio ?? product.precioBase;
        setTotalPrice(newTotal || 0);
    }, [product, selectedMaterial]);

    // --- Buscamos TODAS las personalizaciones por tipo ---
    const materialCustomizations = product?.personalizaciones?.filter(p => p.tipo === 'material') || [];
    const textCustomizations = product?.personalizaciones?.filter(p => p.tipo === 'texto') || [];
    const selectorCustomizations = product?.personalizaciones?.filter(p => p.tipo === 'selector') || [];
    const colorCustomization = product?.personalizaciones?.find(p => p.tipo === 'colores');

    const handleMaterialSelect = (personalizacionLabel, option) => {
        // Lógica de selección/deselección para un grupo de materiales
        setSelectedMaterial(prev => {
            // Deseleccionamos si volvemos a hacer clic en la misma opción
            if (prev && prev.nombre === option.nombre) {
                return null;
            }
            return option;
        });
    };
    
    // --- NUEVO: Handler para manejar múltiples campos de texto ---
    const handleTextChange = (label, text) => {
        setCustomizationsText(prev => ({
            ...prev,
            [label]: text,
        }));
    };

    const handleAddToCart = () => {
        if (!product) return;
        
        // Validamos CADA grupo de material
        for (const custom of materialCustomizations) {
            if (!selectedMaterial) { // Asumimos que solo hay un grupo de material por ahora
                toast.error(`Por favor, elige una opción para "${custom.label}".`);
                return;
            }
        }
        
        if (colorCustomization && selectedColor === null) {
            toast.error(`Por favor, elige una opción de: ${colorCustomization.label}`);
            return;
        }

        if (currentUser) {
            const finalCustomizations = [];

            if (selectedMaterial) {
                // Buscamos a qué grupo pertenece el material seleccionado
                const parentCustomization = materialCustomizations.find(p => p.opciones.some(o => o.nombre === selectedMaterial.nombre));
                if (parentCustomization) {
                    finalCustomizations.push({ type: parentCustomization.label, value: selectedMaterial.nombre });
                }
            }

            Object.entries(selectedOptions).forEach(([label, value]) => {
                if (value) {
                    finalCustomizations.push({ type: label, value });
                }
            });
            
            // Guardar textos personalizados
            Object.entries(customizationsText).forEach(([label, text]) => {
                if (text && text.trim()) {
                    finalCustomizations.push({ type: label, value: text.trim() });
                }
            });

            if (colorCustomization && selectedColor) {
                const colorValue = selectedColor === 'original' ? 'Color Original (de la foto)' : selectedColor.name;
                finalCustomizations.push({ type: colorCustomization.label, value: colorValue });
            }

            const productToAdd = {
              ...product,
              precio: totalPrice,
              quantity,
              customizations: finalCustomizations, 
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
    
    const isAddToCartDisabled = (materialCustomizations.length > 0 && !selectedMaterial) || (colorCustomization && selectedColor === null);

    return (
        <div className="product-detail-page">
            <div className="product-detail-layout">
                <div className="product-images">
                    <img src={product.imagenUrl} alt={product.nombre} className="main-image" />
                </div>

                <div className="product-info-section">
                    <h1 className="product-title">{product.nombre}</h1>
                    <p className="product-detail-price">S/ {totalPrice.toFixed(2)}</p>
                    <p className="product-detail-description">{product.descripcion}</p>
                    
                    <div className="customization-container">
                        {/* --- RENDERIZADO CORREGIDO EN ORDEN --- */}

                        {/* 1. Selectores de Material */}
                        {materialCustomizations.map(custom => (
                            <ProductOptionSelector
                                key={custom.label}
                                customization={custom}
                                selectedOption={selectedMaterial}
                                onOptionSelect={(option) => handleMaterialSelect(custom.label, option)}
                            />
                        ))}

                        {/* Selectores Fijos */}
                        {selectorCustomizations.map(custom => (
                            <ProductOptionSelector
                                key={custom.label}
                                customization={custom}
                                selectedOption={selectedOptions[custom.label]}
                                onOptionSelect={(option) => setSelectedOptions(prev => ({ ...prev, [custom.label]: option }))}
                            />
                        ))}
                        
                        {/* 2. Campos de Texto */}
                        {textCustomizations.map(custom => (
                            <div key={custom.label} className="text-customization-container">
                                <label htmlFor={custom.label}>{custom.label}:</label>
                                <input
                                    type="text"
                                    id={custom.label}
                                    placeholder={`Máx. ${custom.maxLength} caracteres`}
                                    value={customizationsText[custom.label] || ''}
                                    onChange={(e) => handleTextChange(custom.label, e.target.value)}
                                    maxLength={custom.maxLength}
                                    className="custom-text-input"
                                />
                                <small className="char-counter">
                                    {(customizationsText[custom.label] || '').length} / {custom.maxLength}
                                </small>
                            </div>
                        ))}

                        {/* 3. Selector de Color */}
                        {colorCustomization && (
                            <ProductColorSelector product={product} onColorChange={setSelectedColor} />
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
                            {isAddToCartDisabled ? 'Elige tus opciones' : 'Añadir al Carrito'}
                        </button>
                    </div>

                    <div className="product-meta">
                        <span><strong>Stock:</strong> {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}</span>
                        <span><strong>Categorías:</strong> {product.tags ? product.tags.join(', ') : ''}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
