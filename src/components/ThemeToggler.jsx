// src/components/ThemeToggler.jsx

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggler.css'; // Importamos sus estilos

const ThemeToggler = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="theme-toggler" title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggler;