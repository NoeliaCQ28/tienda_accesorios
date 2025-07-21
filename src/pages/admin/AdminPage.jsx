// src/pages/admin/AdminPage.jsx

import React, { useState } from 'react';
import ProductList from './ProductList';
import OrderList from './OrderList';
import Dashboard from './Dashboard'; // <-- 1. Importamos el nuevo componente de métricas
import './AdminPage.css';

const AdminPage = () => {
  // Ahora el estado inicial será 'dashboard'
  const [activeTab, setActiveTab] = useState('dashboard'); 

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Panel de Administración</h2>
        <nav className="admin-nav-tabs">
          {/* --- 2. Añadimos el nuevo botón de pestaña --- */}
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Métricas
          </button>
          <button 
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Productos
          </button>
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Pedidos
          </button>
        </nav>
      </div>
      
      <div className="admin-content">
        {/* --- 3. Añadimos la lógica para renderizar el nuevo componente --- */}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'products' && <ProductList />}
        {activeTab === 'orders' && <OrderList />}
      </div>
    </div>
  );
};

export default AdminPage;