// src/context/CartContext.jsx - Versión final con personalización y Firestore

import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import toast from 'react-hot-toast'; // Importamos toast, ya que lo usas en tu código

export const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart debe usarse dentro de un CartProvider");
    return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  // Función para obtener el carrito desde Firestore
  const fetchCart = async () => {
    if(!currentUser) return;
    setLoading(true);
    try {
        const cartRef = collection(db, 'users', currentUser.uid, 'cart');
        const snapshot = await getDocs(cartRef);
        // El ID del documento es nuestro cartItemId, lo guardamos en el objeto
        const cartData = snapshot.docs.map(doc => ({ cartItemId: doc.id, ...doc.data() }));
        setCart(cartData);
    } catch (error) {
        console.error("Error al cargar el carrito:", error);
        toast.error("No se pudo cargar tu carrito.");
    } finally {
        setLoading(false);
    }
  };

  // Carga el carrito cuando el usuario inicia sesión
  useEffect(() => {
    if (currentUser) {
      fetchCart();
    } else {
      // Si el usuario cierra sesión, se vacía el carrito local
      setCart([]);
    }
  }, [currentUser]);

  const addItem = async (item, quantity) => {
    if (!currentUser) return false;

    // ***** LÓGICA DE PERSONALIZACIÓN INTEGRADA *****
    // 1. Creamos un ID único para el item en el carrito.
    // Si tiene personalización, el ID la incluye. Si no, es solo el ID del producto.
    // Esto permite que 'Pulsera (Roja)' y 'Pulsera (Azul)' sean items diferentes.
    const cartItemId = item.customization
        ? `${item.id}-${item.customization.value}` // ej: 'producto123-Rojo'
        : item.id;

    // 2. Usamos el nuevo cartItemId como la referencia del documento en Firestore.
    const cartItemRef = doc(db, 'users', currentUser.uid, 'cart', cartItemId);
    const productRef = doc(db, 'productos', item.id);

    try {
        const productSnap = await getDoc(productRef);
        if (!productSnap.exists()) throw new Error("El producto no existe");

        const availableStock = productSnap.data().stock;
        const cartItemSnap = await getDoc(cartItemRef);
        const currentQuantityInCart = cartItemSnap.exists() ? cartItemSnap.data().quantity : 0;

        if (currentQuantityInCart + quantity > availableStock) {
            toast.error(`No hay suficiente stock para "${item.nombre}".`);
            return false;
        }

        if (cartItemSnap.exists()) {
            // Si el item exacto (con la misma personalización) ya existe, solo aumenta la cantidad
            await updateDoc(cartItemRef, { quantity: currentQuantityInCart + quantity });
        } else {
            // Si es un item nuevo, lo creamos con todos sus datos
            const newItemData = { ...item, quantity };
            // No es necesario guardar el cartItemId dentro del documento, ya es el ID.
            delete newItemData.cartItemId; 
            await setDoc(cartItemRef, newItemData);
        }

        fetchCart(); // Recargamos el carrito desde Firestore para tener el estado más actualizado
        return true;
    } catch (error) {
        console.error("Error al añadir item:", error);
        toast.error("No se pudo añadir el producto al carrito.");
        return false;
    }
  };
  
  const decreaseItem = async (cartItemId) => {
    if (!currentUser) return;
    const cartItemRef = doc(db, 'users', currentUser.uid, 'cart', cartItemId);
    const cartItemSnap = await getDoc(cartItemRef);

    if(cartItemSnap.exists() && cartItemSnap.data().quantity > 1) {
        await updateDoc(cartItemRef, { quantity: cartItemSnap.data().quantity - 1 });
    } else {
        await deleteDoc(cartItemRef);
    }
    fetchCart();
  };

  const removeItem = async (cartItemId) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'users', currentUser.uid, 'cart', cartItemId));
    fetchCart();
  };
  
  const clear = async () => {
    if (!currentUser) return;
    const cartRef = collection(db, 'users', currentUser.uid, 'cart');
    const querySnapshot = await getDocs(cartRef);
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    setCart([]);
  };

  const totalQuantity = () => cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = () => cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, loading, addItem, removeItem, clear, decreaseItem, totalQuantity, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};