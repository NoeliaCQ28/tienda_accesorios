// src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';
// --- ¡RUTA CORREGIDA! ---
import ProductCard from '../components/ProductCard/ProductCard'; 

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const q = query(collection(db, 'productos'), orderBy('nombre'));
                const querySnapshot = await getDocs(q);
                setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                toast.error("No se pudieron cargar los productos.");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) return <p>Cargando productos...</p>;

    return (
        <div className="product-grid-container">
            <h2>Nuestros Productos</h2>
            <div className="product-grid">
                {products.map(producto => (
                    <ProductCard key={producto.id} product={producto} />
                ))}
            </div>
        </div>
    );
};

export default HomePage;