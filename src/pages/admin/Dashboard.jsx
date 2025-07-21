// src/pages/admin/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { FaBoxOpen, FaChartBar, FaDollarSign, FaUsers } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    bestSellingItem: 'N/A',
    averageOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all_time');

  useEffect(() => {
    const fetchAndCalculateStats = async () => {
      setLoading(true);
      try {
        const ordersRef = collection(db, 'orders');
        
        // Define los estados que cuentan como una venta completada
        const validStatus = ['payment_verified', 'shipped', 'delivered'];
        let q = query(ordersRef, where('status', 'in', validStatus));

        // Añade el filtro de fecha si no es 'all_time'
        if (dateRange !== 'all_time') {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - parseInt(dateRange));
          q = query(ordersRef, where('status', 'in', validStatus), where('createdAt', '>=', startDate));
        }

        const querySnapshot = await getDocs(q);
        const orders = querySnapshot.docs.map(doc => doc.data());
        
        // --- INICIO DE CÁLCULOS ---
        
        // 1. Ingresos totales y total de pedidos
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = orders.length;

        // 2. Artículo más vendido
        const productCounts = {};
        orders.forEach(order => {
          order.items.forEach(item => {
            productCounts[item.nombre] = (productCounts[item.nombre] || 0) + item.quantity;
          });
        });
        
        let bestSellingItem = 'N/A';
        if (Object.keys(productCounts).length > 0) {
          bestSellingItem = Object.keys(productCounts).reduce((a, b) => productCounts[a] > productCounts[b] ? a : b);
        }
        
        // 3. Valor promedio del pedido
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        setStats({
          totalRevenue,
          totalOrders,
          bestSellingItem,
          averageOrderValue
        });

      } catch (error) {
        console.error("Error calculando métricas: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndCalculateStats();
  }, [dateRange]); // Se recalcula cada vez que cambia el rango de fecha

  if (loading) return <p>Calculando métricas...</p>;

  return (
    <div className="dashboard-container">
      <div className="date-filters">
        <button onClick={() => setDateRange('7')} className={dateRange === '7' ? 'active' : ''}>Últimos 7 días</button>
        <button onClick={() => setDateRange('30')} className={dateRange === '30' ? 'active' : ''}>Últimos 30 días</button>
        <button onClick={() => setDateRange('all_time')} className={dateRange === 'all_time' ? 'active' : ''}>Desde siempre</button>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <FaDollarSign className="stat-icon" style={{color: '#10B981'}}/>
          <div className="stat-info">
            <span className="stat-value">S/ {stats.totalRevenue.toFixed(2)}</span>
            <span className="stat-label">Ventas Totales</span>
          </div>
        </div>
        <div className="stat-card">
          <FaChartBar className="stat-icon" style={{color: '#3B82F6'}}/>
          <div className="stat-info">
            <span className="stat-value">{stats.totalOrders}</span>
            <span className="stat-label">Pedidos Completados</span>
          </div>
        </div>
        <div className="stat-card">
          <FaBoxOpen className="stat-icon" style={{color: '#F97316'}}/>
          <div className="stat-info">
            <span className="stat-value">{stats.bestSellingItem}</span>
            <span className="stat-label">Producto Estrella</span>
          </div>
        </div>
         <div className="stat-card">
          <FaUsers className="stat-icon" style={{color: '#8B5CF6'}}/>
          <div className="stat-info">
            <span className="stat-value">S/ {stats.averageOrderValue.toFixed(2)}</span>
            <span className="stat-label">Valor Promedio por Pedido</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;