// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Admin.css'; // Reutilizamos los estilos del formulario de admin

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth(); // Usamos nuestro hook personalizado
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/admin'); // Redirigimos al admin después del login exitoso
    } catch (error) {
      setError("Error al iniciar sesión. Verifica tus credenciales.");
      console.error(error.code, error.message);
    }
  };

  return (
    <div className="admin-container">
      <form className="product-form" onSubmit={handleSubmit}>
        <h3>Iniciar Sesión - Admin</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
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

export default LoginPage;