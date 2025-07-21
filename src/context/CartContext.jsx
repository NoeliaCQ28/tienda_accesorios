// src/context/CartContext.jsx - Lógica separada de la UI

import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';

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

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      const cartRef = collection(db, 'users', currentUser.uid, 'cart');
      getDocs(cartRef).then(snapshot => {
        const cartData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCart(cartData);
      }).finally(() => setLoading(false));
    } else {
      setCart([]);
    }
  }, [currentUser]);

  const addItem = async (item, quantity) => {
    if (!currentUser) return false;

    const cartRef = doc(db, 'users', currentUser.uid, 'cart', item.id);
    const productRef = doc(db, 'productos', item.id);

    try {
        const productSnap = await getDoc(productRef);
        if (!productSnap.exists()) throw new Error("El producto no existe");

        const availableStock = productSnap.data().stock;
        const cartItemSnap = await getDoc(cartRef);
        const currentQuantityInCart = cartItemSnap.exists() ? cartItemSnap.data().quantity : 0;

        if (currentQuantityInCart + quantity > availableStock) {
            toast.error(`No hay suficiente stock para "${item.nombre}".`); // Usaremos toast para errores
            return false; // Devolvemos false si no hay stock
        }

        if (cartItemSnap.exists()) {
            await updateDoc(cartRef, { quantity: currentQuantityInCart + quantity });
        } else {
            await setDoc(cartRef, { ...item, quantity: quantity });
        }

        fetchCart(); // Recargamos el carrito desde Firestore para tener el estado más actualizado
        return true; // Devolvemos true si la operación fue exitosa
    } catch (error) {
        console.error("Error al añadir item:", error);
        return false;
    }
  };

  const fetchCart = async () => {
    if(!currentUser) return;
    const cartRef = collection(db, 'users', currentUser.uid, 'cart');
    const snapshot = await getDocs(cartRef);
    const cartData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCart(cartData);
  }
  
  const decreaseItem = async (itemId) => {
    if (!currentUser) return;
    const cartRef = doc(db, 'users', currentUser.uid, 'cart', itemId);
    const cartItemSnap = await getDoc(cartRef);
    if(cartItemSnap.exists() && cartItemSnap.data().quantity > 1) {
        await updateDoc(cartRef, { quantity: cartItemSnap.data().quantity - 1 });
    } else {
        await deleteDoc(cartRef);
    }
    fetchCart();
  };

  const removeItem = async (itemId) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'users', currentUser.uid, 'cart', itemId));
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