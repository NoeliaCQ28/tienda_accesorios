// src/pages/CategoryPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import toast from 'react-hot-toast';
// --- ¡RUTA CORREGIDA! ---
import ProductCard from '../components/ProductCard/ProductCard';
import SearchFilters from '../components/SearchFilters';
import { useSearch } from '../context/SearchContext';
import './CategoryPage.css';

const CategoryPage = () => {
    const { categoryId } = useParams();
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const { applyFilters, filters, updateFilters } = useSearch();

    useEffect(() => {
        const fetchProductsByCategory = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, 'productos'), where('tags', 'array-contains', categoryId));
                const querySnapshot = await getDocs(q);
                const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllProducts(productsData);
            } catch (error) {
                console.error("Error al cargar productos de la categoría: ", error);
                toast.error("No se pudieron cargar los productos.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductsByCategory();
    }, [categoryId]);

    // Establecer el filtro de categoría actual solo una vez
    useEffect(() => {
        // Solo actualizar si la categoría actual no está en los filtros
        if (!filters.categories.includes(categoryId)) {
            updateFilters({ categories: [categoryId] });
        }
    }, [categoryId, filters.categories]); // Removí updateFilters de las dependencias para evitar bucle infinito

    // Aplicar filtros cuando cambian
    useEffect(() => {
        if (allProducts.length > 0) {
            const filteredProducts = applyFilters(allProducts);
            setProducts(filteredProducts);
        }
    }, [allProducts, applyFilters]); // Mantuve solo applyFilters que ahora es estable

    const getResultsCount = () => {
        if (loading) return '';
        return `(${products.length} producto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''})`;
    };

    if (loading) {
        return (
            <div className="category-page">
                <div className="loading-container">
                    <h2>Cargando productos...</h2>
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="category-page">
            <div className="category-header">
                <div className="category-title">
                    <h2>Categoría: {categoryId.charAt(0).toUpperCase() + categoryId.slice(1)}</h2>
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
                        <p>No hay productos disponibles en esta categoría con los filtros aplicados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;