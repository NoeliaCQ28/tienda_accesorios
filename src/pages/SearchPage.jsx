// src/pages/SearchPage.jsx

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import ProductCard from '../components/ProductCard/ProductCard';
import toast from 'react-hot-toast';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('q');

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            if (!searchTerm || searchTerm.trim() === '') {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                // --- LÓGICA DE BÚSQUEDA MULTI-PALABRA ---

                // 1. Dividimos el término de búsqueda en palabras individuales (tokens).
                const searchTokens = searchTerm.toLowerCase().split(' ').filter(token => token.length > 0);

                if (searchTokens.length === 0) {
                    setResults([]);
                    setLoading(false);
                    return;
                }

                // 2. Hacemos una consulta inicial a Firestore usando solo el PRIMER token.
                //    Esto nos da una lista inicial de posibles candidatos.
                const initialQuery = query(
                    collection(db, 'productos'),
                    where('tags', 'array-contains', searchTokens[0])
                );

                const querySnapshot = await getDocs(initialQuery);
                const initialResults = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // 3. Si hay más de una palabra, filtramos los resultados en el cliente.
                //    Nos quedamos solo con los productos que contengan TODAS las palabras de la búsqueda.
                const finalResults = searchTokens.length > 1
                    ? initialResults.filter(product => 
                        searchTokens.every(token => product.tags.includes(token))
                      )
                    : initialResults;

                setResults(finalResults);

            } catch (error) {
                console.error("Error al realizar la búsqueda: ", error);
                toast.error("Hubo un error al buscar.");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [searchTerm]);

    return (
        <div className="product-grid-container">
            {loading ? (
                <h2>Buscando...</h2>
            ) : (
                <>
                    <h2>Resultados para: "{searchTerm}"</h2>
                    <div className="product-grid">
                        {results.length > 0 ? (
                            results.map(producto => (
                                <ProductCard key={producto.id} product={producto} />
                            ))
                        ) : (
                            <p>No se encontraron productos que coincidan con tu búsqueda.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default SearchPage;