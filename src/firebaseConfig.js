// src/firebaseConfig.js - VERSIÓN FINAL Y CORRECTA CON TUS DATOS

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Este es el objeto de configuración REAL y ÚNICO de tu proyecto de Firebase.
const firebaseConfig = {
  apiKey: "AIzaSyAJyEa8F5jiJC5ZsQophpB6_2bdtPGdPqg",
  authDomain: "accesorios-liath.firebaseapp.com",
  projectId: "accesorios-liath",
  storageBucket: "accesorios-liath.firebasestorage.app",
  messagingSenderId: "407961899105",
  appId: "1:407961899105:web:f34b560d161908a921da20",
  measurementId: "G-QDV2M9WDWJ"
};

// Inicializamos Firebase con tu configuración
const app = initializeApp(firebaseConfig);

// Inicializamos los servicios que necesitamos y los exportamos para usarlos en la app
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };