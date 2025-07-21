// src/context/AuthContext.jsx - VERSIÓN FINAL CON TODAS LAS FUNCIONALIDADES

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para registrar nuevos clientes con Email/Contraseña
  const register = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDocRef = doc(db, "users", user.uid);
    // Por defecto, todo nuevo registro es un "cliente"
    await setDoc(userDocRef, { email: user.email, role: "cliente" });
  };

  // Función para iniciar sesión con Email/Contraseña
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDocRef = doc(db, "users", userCredential.user.uid);
    const docSnap = await getDoc(userDocRef);
    // Devuelve el rol para la redirección inteligente
    return docSnap.exists() ? docSnap.data().role : "cliente";
  };
  
  // Función para iniciar sesión con Google
  const loginWithGoogle = async () => {
    const googleProvider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    const userDocRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userDocRef);

    // Si el usuario de Google no existe en nuestra base de datos, lo creamos
    if (!docSnap.exists()) {
      await setDoc(userDocRef, {
        email: user.email,
        role: "cliente",
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
    }
    // No es necesario devolver el rol aquí, el useEffect se encargará
  };

  // Función para enviar correo de reseteo de contraseña
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Función para cerrar la sesión
  const logout = () => signOut(auth);

  // Efecto para escuchar los cambios de autenticación en toda la app
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Si hay un usuario, buscamos su documento para obtener su rol
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          // Combinamos la info de auth con nuestro rol de firestore
          setCurrentUser({ ...user, role: docSnap.data().role });
        } else {
          // Si por alguna razón no tiene doc, lo tratamos como usuario básico
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    // Proveemos el estado y todas las funciones al resto de la aplicación
    <AuthContext.Provider value={{ currentUser, loading, register, login, logout, resetPassword, loginWithGoogle }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}