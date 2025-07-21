// src/pages/AdminLoginPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Admin.css'; // Reutilizamos los estilos del formulario

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  // Si un admin ya está logueado y llega aquí, lo mandamos al panel
  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      navigate('/admin');
    }
  }, [currentUser, navigate]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userRole = await login(email, password);
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        setError('Estas credenciales no pertenecen a un administrador.');
      }
    } catch (error) {
      setError('Credenciales incorrectas.');
      console.error(error);
    }
  };

  return (
    <div className="admin-container" style={{ paddingTop: '60px' }}>
      <form className="product-form" onSubmit={handleAdminLogin}>
        <h3>Acceso de Administrador</h3>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="submit-btn">Entrar</button>
      </form>
    </div>
  );
};

export default AdminLoginPage;