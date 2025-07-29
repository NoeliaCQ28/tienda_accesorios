// src/pages/admin/components/ComponentGrid.jsx

import React from 'react';
import './ComponentGrid.css';

const ComponentGrid = ({ components, onEdit, onDelete, variant = 'grid' }) => {
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStockStatus = (stock, minStock) => {
    if (stock === 0) return 'out';
    if (stock <= minStock) return 'low';
    return 'good';
  };

  const getStockStatusText = (stock, minStock) => {
    if (stock === 0) return 'Agotado';
    if (stock <= minStock) return 'Stock bajo';
    return 'En stock';
  };

  const renderGridView = () => (
    <div className="component-grid">
      {components.map(component => (
        <div key={component.id} className="grid-item">
          <div className="grid-image">
            {component.images && component.images.length > 0 ? (
              <img 
                src={component.images.find(img => img.isMain)?.url || component.images[0].url} 
                alt={component.name}
              />
            ) : (
              <div 
                className="color-placeholder"
                style={{ backgroundColor: component.color }}
              />
            )}
            <div className="grid-overlay">
              <button
                className="overlay-btn edit-btn"
                onClick={() => onEdit(component)}
                title="Editar"
              >
                ✏️
              </button>
              <button
                className="overlay-btn delete-btn"
                onClick={() => onDelete(component.id)}
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>
          
          <div className="grid-info">
            <h4 className="grid-name">{component.name}</h4>
            <div className="grid-details">
              <span className="grid-type">{component.type}</span>
              {component.subtype && (
                <span className="grid-subtype">• {component.subtype}</span>
              )}
            </div>
            
            <div className="grid-color">
              <div 
                className="color-dot"
                style={{ backgroundColor: component.color }}
              />
              <span>{component.colorName || component.color}</span>
            </div>

            {component.sku && (
              <div className="grid-sku">SKU: {component.sku}</div>
            )}

            <div className={`grid-stock ${getStockStatus(component.stock, component.minStock)}`}>
              Stock: {component.stock || 0} • {getStockStatusText(component.stock, component.minStock)}
            </div>

            {component.costPrice > 0 && (
              <div className="grid-price">
                Costo: S/ {component.costPrice.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderCardsView = () => (
    <div className="component-cards">
      {components.map(component => (
        <div key={component.id} className="card-item">
          <div className="card-header">
            <div className="card-image">
              {component.images && component.images.length > 0 ? (
                <img 
                  src={component.images.find(img => img.isMain)?.url || component.images[0].url} 
                  alt={component.name}
                />
              ) : (
                <div 
                  className="color-placeholder"
                  style={{ backgroundColor: component.color }}
                />
              )}
            </div>
            
            <div className="card-title-section">
              <h4 className="card-name">{component.name}</h4>
              <div className="card-meta">
                <span className="card-type">{component.type}</span>
                {component.subtype && <span className="card-subtype">({component.subtype})</span>}
              </div>
            </div>

            <div className="card-actions">
              <button
                className="card-action-btn edit"
                onClick={() => onEdit(component)}
                title="Editar"
              >
                ✏️
              </button>
              <button
                className="card-action-btn delete"
                onClick={() => onDelete(component.id)}
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>

          <div className="card-body">
            {component.description && (
              <p className="card-description">{component.description}</p>
            )}

            <div className="card-details">
              <div className="detail-row">
                <span className="detail-label">Color:</span>
                <div className="detail-color">
                  <div 
                    className="color-dot"
                    style={{ backgroundColor: component.color }}
                  />
                  <span>{component.colorName || component.color}</span>
                </div>
              </div>

              {component.sku && (
                <div className="detail-row">
                  <span className="detail-label">SKU:</span>
                  <code className="detail-sku">{component.sku}</code>
                </div>
              )}

              <div className="detail-row">
                <span className="detail-label">Stock:</span>
                <span className={`detail-stock ${getStockStatus(component.stock, component.minStock)}`}>
                  {component.stock || 0} unidades
                </span>
              </div>

              {component.costPrice > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Precio:</span>
                  <div className="detail-prices">
                    <span className="cost-price">Costo: S/ {component.costPrice.toFixed(2)}</span>
                    {component.calculatedPrice && (
                      <span className="sell-price">Venta: S/ {component.calculatedPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              )}

              {component.supplier && (
                <div className="detail-row">
                  <span className="detail-label">Proveedor:</span>
                  <span className="detail-supplier">{component.supplier}</span>
                </div>
              )}

              <div className="detail-row">
                <span className="detail-label">Usos:</span>
                <span className="detail-usage">{component.usageCount || 0} veces</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Creado:</span>
                <span className="detail-date">{formatDate(component.createdAt)}</span>
              </div>
            </div>

            {component.tags && component.tags.length > 0 && (
              <div className="card-tags">
                {component.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return variant === 'cards' ? renderCardsView() : renderGridView();
};

export default ComponentGrid;
