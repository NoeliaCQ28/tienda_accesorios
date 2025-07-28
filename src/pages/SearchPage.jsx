// src/pages/SearchPage.jsx

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import ProductCard from '../components/ProductCard/ProductCard';
import SearchFilters from '../components/SearchFilters';
import { useSearch } from '../context/SearchContext';
import toast from 'react-hot-toast';
import './SearchPage.css';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('q');
    const categoryParam = searchParams.get('category');

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    
    const { setSearchTerm, updateFilters, applyFilters, filters } = useSearch();

    useEffect(() => {
        // Sincronizar el término de búsqueda con el contexto
        if (searchTerm) {
            setSearchTerm(searchTerm);
        }
        
        // Aplicar filtro de categoría si viene de URL
        if (categoryParam) {
            updateFilters({ categories: [categoryParam] });
        }
    }, [searchTerm, categoryParam, setSearchTerm]); // Removí updateFilters para evitar bucle

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                let initialResults = [];

                if (searchTerm && searchTerm.trim() !== '') {
                    // Búsqueda por término
                    const searchTokens = searchTerm.toLowerCase().split(' ').filter(token => token.length > 0);

                    if (searchTokens.length > 0) {
                        const initialQuery = query(
                            collection(db, 'productos'),
                            where('tags', 'array-contains', searchTokens[0])
                        );

                        const querySnapshot = await getDocs(initialQuery);
                        initialResults = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                        // Filtrar por múltiples palabras en el cliente
                        if (searchTokens.length > 1) {
                            initialResults = initialResults.filter(product => 
                                searchTokens.every(token => product.tags.includes(token))
                            );
                        }
                    }
                } else if (categoryParam) {
                    // Búsqueda por categoría
                    const categoryQuery = query(
                        collection(db, 'productos'),
                        where('tags', 'array-contains', categoryParam)
                    );
                    
                    const querySnapshot = await getDocs(categoryQuery);
                    initialResults = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                } else {
                    // Cargar todos los productos si no hay término de búsqueda específico
                    const allQuery = query(collection(db, 'productos'));
                    const querySnapshot = await getDocs(allQuery);
                    initialResults = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                }

                setAllProducts(initialResults);

            } catch (error) {
                console.error("Error al realizar la búsqueda: ", error);
                toast.error("Hubo un error al buscar.");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [searchTerm, categoryParam]);

    // Aplicar filtros cuando cambian
    useEffect(() => {
        if (allProducts.length > 0) {
            const filteredResults = applyFilters(allProducts);
            setResults(filteredResults);
        }
    }, [allProducts, applyFilters]); // Mantuve solo applyFilters que ahora es estable

    const getPageTitle = () => {
        if (searchTerm) {
            return `Resultados para: "${searchTerm}"`;
        } else if (categoryParam) {
            return `Categoría: ${categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)}`;
        } else {
            return 'Búsqueda de productos';
        }
    };

    const getResultsCount = () => {
        if (loading) return '';
        return `(${results.length} producto${results.length !== 1 ? 's' : ''} encontrado${results.length !== 1 ? 's' : ''})`;
    };

    return (
        <div className="product-grid-container">
            {loading ? (
                <div className="loading-container">
                    <h2>Buscando productos...</h2>
                    <div className="loading-spinner"></div>
                </div>
            ) : (
                <>
                    <div className="search-header">
                        <div className="search-title">
                            <h2>{getPageTitle()}</h2>
                            <span className="results-count">{getResultsCount()}</span>
                        </div>
                        <SearchFilters />
                    </div>
                    
                    <div className="product-grid">
                        {results.length > 0 ? (
                            results.map(producto => (
                                <ProductCard key={producto.id} product={producto} />
                            ))
                        ) : (
                            <div className="no-results">
                                <h3>No se encontraron productos</h3>
                                <p>
                                    {searchTerm || categoryParam
                                        ? 'Intenta ajustar los filtros o buscar con otros términos.'
                                        : 'Prueba a buscar algo específico o explorar nuestras categorías.'
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default SearchPage;