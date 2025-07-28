// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext'; // <-- 1. IMPORTAMOS EL THEME PROVIDER
import { SearchProvider } from './context/SearchContext'; // <-- IMPORTAMOS EL SEARCH PROVIDER
import App from './App.jsx';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            {/* 2. ENVOLVEMOS LA APP CON EL THEME PROVIDER */}
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);