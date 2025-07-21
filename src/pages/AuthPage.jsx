// src/pages/AuthPage.jsx - Versión Final con todas las opciones

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../pages/Admin.css'; // Reutilizamos estilos
import './AuthPage.css';   // Estilos para los botones sociales

const AuthPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Obtenemos todas las funciones que necesitamos de nuestro contexto
  const { register, login, loginWithGoogle, currentUser, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Redirige si ya hay un usuario logueado
  useEffect(() => {
    if (currentUser) {
      const targetPath = currentUser.role === 'admin' ? '/admin' : '/tienda';
      navigate(targetPath);
    }
  }, [currentUser, navigate]);

  // Manejador para el formulario de Email/Contraseña
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        await register(email, password);
        alert("¡Cuenta creada con éxito!");
        // La redirección la maneja el useEffect
      } else {
        await login(email, password);
        // La redirección la maneja el useEffect
      }
    } catch (error) {
      setError("Error. Verifica credenciales o el email ya está en uso.");
    }
  };

  // Manejador para el botón de Google
  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
      // El useEffect se encargará de la redirección
    } catch (error) {
      setError("Hubo un error al iniciar sesión con Google.");
      console.error(error);
    }
  };

  // Manejador para el reseteo de contraseña
  const handlePasswordReset = async () => {
    if (!email) {
      setError("Por favor, introduce tu email en el campo de arriba para restablecer la contraseña.");
      return;
    }
    try {
      await resetPassword(email);
      setError('');
      alert("Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.");
    } catch (error) {
      setError("Error al enviar el correo de restablecimiento.");
    }
  };

  if (currentUser) return <h1>Redirigiendo...</h1>;

  return (
    <div className="admin-container" style={{paddingTop: '60px'}}>
      <form className="product-form" onSubmit={handleEmailSubmit}>
        <h3>{isRegistering ? 'Crear Nueva Cuenta' : 'Iniciar Sesión'}</h3>
        
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        {/* --- BOTÓN DE GOOGLE RESTAURADO --- */}
        <div className="social-login-buttons" style={{marginBottom: '20px'}}>
          <button type="button" className="google-btn" onClick={handleGoogleLogin}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
            Continuar con Google
          </button>
        </div>

        <div className="divider"><span>O</span></div>
        
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="Escribe tu correo aquí..." value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        
        <div className="form-group">
          <label>{isRegistering ? 'Crear Contraseña' : 'Contraseña'}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={isRegistering} />
        </div>

        {!isRegistering && (
            <p className="forgot-password" onClick={handlePasswordReset}>
              ¿Olvidaste tu contraseña?
            </p>
        )}

        <button type="submit" className="submit-btn">
          {isRegistering ? 'Registrarse' : 'Entrar'}
        </button>
        
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          {isRegistering ? '¿Ya tienes una cuenta? ' : '¿No tienes una cuenta? '}
          <span 
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            style={{ color: 'var(--color-primario)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isRegistering ? 'Inicia sesión' : 'Crea una aquí'}
          </span>
        </p>
      </form>
    </div>
  );
};

export default AuthPage;