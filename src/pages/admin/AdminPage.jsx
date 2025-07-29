// src/pages/admin/AdminPage.jsx

import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import ProductList from './ProductList';
import OrderList from './OrderList';
import Dashboard from './Dashboard';
import AddProduct from './AddProduct';
import EditProduct from './EditProduct';
import ComponentManager from './ComponentManager';
import './AdminPage.css';

const AdminPage = () => {
  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Panel de Administración</h2>
        <nav className="admin-nav-tabs">
          <NavLink 
            to="/admin" 
            end 
            className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
          >
            Métricas
          </NavLink>
          <NavLink 
            to="/admin/products" 
            className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
          >
            Productos
          </NavLink>
          <NavLink 
            to="/admin/orders" 
            className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
          >
            Pedidos
          </NavLink>
          <NavLink 
            to="/admin/components" 
            className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
          >
            Componentes
          </NavLink>
        </nav>
      </div>
      
      <div className="admin-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="components" element={<ComponentManager />} />
          <Route path="add" element={<AddProduct />} />
          <Route path="edit/:productId" element={<EditProduct />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPage;
