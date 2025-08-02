// src/pages/admin/components/ComponentStats.jsx

import React from 'react';
import './ComponentStats.css';

const ComponentStats = ({ components }) => {
  // Calcular estadísticas
  const totalComponents = components.length;
  const uniqueTypes = [...new Set(components.map(c => c.type))].length;
  const totalUsage = components.reduce((sum, c) => sum + (c.usageCount || 0), 0);
  const lowStockCount = components.filter(c => 
    c.stock !== undefined && c.stock < (c.minStock || 5)
  ).length;

  // Tipo más usado
  const typeUsage = components.reduce((acc, component) => {
    acc[component.type] = (acc[component.type] || 0) + (component.usageCount || 0);
    return acc;
  }, {});
  
  const mostUsedType = Object.entries(typeUsage)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

  const stats = [
    {
      label: 'Total Componentes',
      value: totalComponents,
      icon: '📦',
      color: '#667eea'
    },
    {
      label: 'Tipos Diferentes',
      value: uniqueTypes,
      icon: '🏷️',
      color: '#f093fb'
    },
    {
      label: 'Usos Totales',
      value: totalUsage,
      icon: '📊',
      color: '#4facfe'
    },
    {
      label: 'Stock Bajo',
      value: lowStockCount,
      icon: '⚠️',
      color: lowStockCount > 0 ? '#ff6b6b' : '#51cf66'
    },
    {
      label: 'Tipo Más Usado',
      value: mostUsedType,
      icon: '🌟',
      color: '#feca57',
      isText: true
    }
  ];

  return (
    <div className="component-stats">
      {stats.map((stat, index) => (
        <div 
          key={stat.label} 
          className="stat-card"
          style={{ '--stat-color': stat.color }}
        >
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-content">
            <div className="stat-value">
              {stat.isText ? stat.value : stat.value.toLocaleString()}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComponentStats;
