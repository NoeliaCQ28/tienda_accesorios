// src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';
// --- ¡RUTA CORREGIDA! ---
import ProductCard from '../components/ProductCard/ProductCard'; 
import SearchFilters from '../components/SearchFilters';
import { useSearch } from '../context/SearchContext'; 

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const { applyFilters, filters } = useSearch();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const q = query(collection(db, 'productos'), orderBy('nombre'));
                const querySnapshot = await getDocs(q);
                const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllProducts(productsData);
            } catch (error) {
                toast.error("No se pudieron cargar los productos.");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Aplicar filtros cuando cambian
    useEffect(() => {
        if (allProducts.length > 0) {
            const filteredProducts = applyFilters(allProducts);
            setProducts(filteredProducts);
        }
    }, [allProducts, applyFilters]); // Mantuve solo applyFilters que ahora es estable

    const getResultsCount = () => {
        if (loading) return '';
        return `(${products.length} producto${products.length !== 1 ? 's' : ''} disponible${products.length !== 1 ? 's' : ''})`;
    };

    if (loading) {
        return (
            <div className="product-grid-container">
                <div className="loading-container">
                    <h2>Cargando productos...</h2>
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="product-grid-container">
            <div className="page-header">
                <div className="page-title">
                    <h2>Nuestros Productos</h2>
                    <span className="results-count">{getResultsCount()}</span>
                </div>
                <SearchFilters />
            </div>
            
            <div className="product-grid">
                {products.length > 0 ? (
                    products.map(producto => (
                        <ProductCard key={producto.id} product={producto} />
                    ))
                ) : (
                    <div className="no-results">
                        <h3>No se encontraron productos</h3>
                        <p>No hay productos disponibles con los filtros aplicados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;