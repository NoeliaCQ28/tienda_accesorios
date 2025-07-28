// src/context/CartContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import toast from 'react-hot-toast';

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

  const fetchCart = async () => {
    if(!currentUser) return;
    setLoading(true);
    try {
        const cartRef = collection(db, 'users', currentUser.uid, 'cart');
        const snapshot = await getDocs(cartRef);
        const cartData = snapshot.docs.map(doc => ({ cartItemId: doc.id, ...doc.data() }));
        setCart(cartData);
    } catch (error) {
        console.error("Error al cargar el carrito:", error);
        toast.error("No se pudo cargar tu carrito.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [currentUser]);

  // --- INICIO DE LA MODIFICACIÓN CLAVE ---
  const addItem = async (item, quantity) => {
    if (!currentUser) return false;

    // 1. Crear un identificador único para la variante del producto.
    //    Esto convierte las personalizaciones en un string consistente.
    //    Ej: "material:acero-dorado|texto:ab"
    const generateVariantId = (customizations) => {
        if (!customizations || customizations.length === 0) {
            return 'default';
        }
        // Ordenamos las personalizaciones por tipo para que el orden no importe
        return customizations
            .sort((a, b) => a.type.localeCompare(b.type))
            .map(c => `${c.type.toLowerCase()}:${c.value.toLowerCase().replace(/\s+/g, '-')}`)
            .join('|');
    };

    const variantId = generateVariantId(item.customizations);
    // 2. Crear el ID final para el documento en Firestore.
    //    Ej: "producto123-material:acero-dorado|texto:ab"
    const cartItemId = `${item.id}-${variantId}`;
    
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
            // Si el item con la misma personalización exacta ya existe, solo aumenta la cantidad
            await updateDoc(cartItemRef, { quantity: currentQuantityInCart + quantity });
        } else {
            // Si es una variante nueva, la creamos con todos sus datos
            const newItemData = { ...item, quantity };
            
            // No guardamos el ID dentro del documento, ya es el nombre del documento
            delete newItemData.cartItemId; 
            
            await setDoc(cartItemRef, newItemData);
        }

        fetchCart(); // Recargamos el carrito desde Firestore
        return true;
    } catch (error) {
        console.error("Error al añadir item:", error);
        toast.error("No se pudo añadir el producto al carrito.");
        return false;
    }
  };
  // --- FIN DE LA MODIFICACIÓN CLAVE ---
  
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