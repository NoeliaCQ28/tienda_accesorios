// src/components/ProtectedRoute.jsx - Versión con Roles

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

// El componente ahora acepta una prop "allowedRoles"
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return <h1>Cargando...</h1>;

  // Si no hay usuario, siempre redirigimos a la página de bienvenida
  if (!currentUser) return <Navigate to="/" />;

  // Si la ruta requiere roles específicos y el rol del usuario no está en la lista...
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // ...lo redirigimos a la tienda. Es una página segura a la que todos los logueados pueden ir.
    return <Navigate to="/tienda" />;
  }

  // Si todo está bien, mostramos la página protegida
  return <>{children}</>;
};

export default ProtectedRoute;