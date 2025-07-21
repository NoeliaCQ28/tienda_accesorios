// src/pages/CategoryPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import toast from 'react-hot-toast';
// --- ¡RUTA CORREGIDA! ---
import ProductCard from '../components/ProductCard/ProductCard';

const CategoryPage = () => {
    const { categoryId } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductsByCategory = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, 'productos'), where('tags', 'array-contains', categoryId));
                const querySnapshot = await getDocs(q);
                setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Error al cargar productos de la categoría: ", error);
                toast.error("No se pudieron cargar los productos.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductsByCategory();
    }, [categoryId]);

    if (loading) return <p>Cargando productos...</p>;

    return (
        <div className="product-grid-container">
            <h2>Categoría: {categoryId.charAt(0).toUpperCase() + categoryId.slice(1)}</h2>
            <div className="product-grid">
                {products.length > 0 ? (
                    products.map(producto => (
                        <ProductCard key={producto.id} product={producto} />
                    ))
                ) : (
                    <p>No hay productos en esta categoría.</p>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;