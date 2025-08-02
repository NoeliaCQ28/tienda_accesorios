// src/pages/admin/components/ComponentDetailModal.jsx

import React from 'react';
import './ComponentDetailModal.css';

const ComponentDetailModal = ({ component, onClose, onEdit }) => {
  if (!component) return null;

  const formatDate = (date) => {
    if (!date) return 'No disponible';
    if (date.toDate) return date.toDate().toLocaleDateString('es-ES');
    if (date instanceof Date) return date.toLocaleDateString('es-ES');
    return 'No disponible';
  };

  const getUnitDisplay = (unit) => {
    if (unit === 'gramo') return 'gramos';
    if (unit === 'metro') return 'metros';
    return 'unidades';
  };

  const getStockStatus = () => {
    if (component.stock <= 0) return { class: 'out-of-stock', text: 'Sin stock' };
    if (component.stock <= component.minStock) return { class: 'low-stock', text: 'Stock bajo' };
    return { class: 'good-stock', text: 'Stock normal' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="component-detail-modal-overlay" onClick={onClose}>
      <div className="component-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{component.name}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="detail-columns">
            {/* Columna izquierda - Imágenes */}
            <div className="detail-column">
              {component.images && component.images.length > 0 ? (
                <div className="main-image-container">
                  <img 
                    src={component.images[0].url || component.images[0]} 
                    alt={component.name} 
                    className="main-image"
                  />
                  {component.images.length > 1 && (
                    <div className="thumbnails">
                      {component.images.slice(1).map((img, i) => (
                        <img 
                          key={i} 
                          src={img.url || img} 
                          alt={`Vista ${i+2}`} 
                          className="thumbnail"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-image-placeholder">
                  {component.type === 'pastilla' ? (
                    <div className="pastilla-large-preview">
                      <div 
                        className="pastilla-large-sample"
                        style={{
                          backgroundColor: component.colorFondo || '#CCCCCC',
                          border: '3px solid #ddd'
                        }}
                      >
                        <div 
                          className="pastilla-large-interior"
                          style={{
                            backgroundColor: component.colorInterior || '#FFFFFF'
                          }}
                        ></div>
                        {component.luminiscente && <div className="pastilla-large-glow"></div>}
                      </div>
                      <p>Vista previa de pastilla</p>
                    </div>
                  ) : (
                    <div className="color-only-preview">
                      <div 
                        className="color-circle"
                        style={{ 
                          backgroundColor: component.color || '#CCCCCC',
                          boxShadow: `0 0 0 1px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.15)`
                        }}
                      ></div>
                      <p>Muestra de color</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Columna derecha - Información */}
            <div className="detail-column">
              <div className="detail-section">
                <h4>📋 Información General</h4>
                <table className="detail-table">
                  <tbody>
                    <tr>
                      <td>Tipo:</td>
                      <td><span className="capitalize">{component.type}</span></td>
                    </tr>
                    {component.subtype && (
                      <tr>
                        <td>Subtipo:</td>
                        <td><span className="capitalize">{component.subtype}</span></td>
                      </tr>
                    )}
                    <tr>
                      <td>SKU:</td>
                      <td><code>{component.sku}</code></td>
                    </tr>
                    <tr>
                      <td>Color:</td>
                      <td>
                        <div className="color-info">
                          <span 
                            className="color-dot" 
                            style={{backgroundColor: component.color}}
                          ></span>
                          {component.colorName || 'Sin nombre'}
                        </div>
                      </td>
                    </tr>
                    {component.type === 'pastilla' && (
                      <>
                        <tr>
                          <td>Color Interior:</td>
                          <td>
                            <div className="color-info">
                              <span 
                                className="color-dot" 
                                style={{backgroundColor: component.colorInterior}}
                              ></span>
                              {component.colorNombreInterior || 'Sin nombre'}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>Luminiscente:</td>
                          <td>
                            <span className={component.luminiscente ? 'badge-yes' : 'badge-no'}>
                              {component.luminiscente ? '✨ Sí' : '❌ No'}
                            </span>
                          </td>
                        </tr>
                      </>
                    )}
                    <tr>
                      <td>Unidad:</td>
                      <td><span className="unit-badge">{component.unidadMedida || 'Unidad'}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="detail-section">
                <h4>📦 Inventario</h4>
                <table className="detail-table">
                  <tbody>
                    <tr>
                      <td>Stock:</td>
                      <td>
                        <span className={`stock-value ${stockStatus.class}`}>
                          {component.stock} {getUnitDisplay(component.unidadMedida)}
                        </span>
                        <span className={`stock-status ${stockStatus.class}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Stock mínimo:</td>
                      <td>{component.minStock} {getUnitDisplay(component.unidadMedida)}</td>
                    </tr>
                    {component.unidadMedida !== 'unidad' && (
                      <>
                        <tr>
                          <td>Cantidad mínima:</td>
                          <td>{component.cantidadMinima} {getUnitDisplay(component.unidadMedida)}</td>
                        </tr>
                        <tr>
                          <td>Incremento:</td>
                          <td>{component.incremento} {getUnitDisplay(component.unidadMedida)}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="detail-section">
                <h4>💰 Precios</h4>
                <table className="detail-table">
                  <tbody>
                    <tr>
                      <td>Costo:</td>
                      <td>
                        <span className="price">S/ {(component.costPrice || 0).toFixed(2)}</span>
                        {component.unidadMedida !== 'unidad' && 
                          <span className="per-unit"> / {component.unidadMedida}</span>
                        }
                      </td>
                    </tr>
                    <tr>
                      <td>Margen:</td>
                      <td><span className="margin">{component.suggestedMargin || 0}%</span></td>
                    </tr>
                    <tr>
                      <td>Precio sugerido:</td>
                      <td>
                        <span className="price suggested">S/ {(component.calculatedPrice || 0).toFixed(2)}</span>
                        {component.unidadMedida !== 'unidad' && 
                          <span className="per-unit"> / {component.unidadMedida}</span>
                        }
                      </td>
                    </tr>
                    {component.finalPrice && component.finalPrice !== component.calculatedPrice && (
                      <tr>
                        <td>Precio final:</td>
                        <td>
                          <span className="price final">S/ {component.finalPrice.toFixed(2)}</span>
                          {component.unidadMedida !== 'unidad' && 
                            <span className="per-unit"> / {component.unidadMedida}</span>
                          }
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="detail-full-width">
            {component.description && (
              <div className="detail-section">
                <h4>📝 Descripción</h4>
                <p className="description">{component.description}</p>
              </div>
            )}
            
            {component.tags && component.tags.length > 0 && (
              <div className="detail-section">
                <h4>🏷️ Etiquetas</h4>
                <div className="tags">
                  {component.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="detail-section">
              <h4>📊 Información Adicional</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>Proveedor:</label>
                  <span>{component.supplier || 'No especificado'}</span>
                </div>
                <div className="info-item">
                  <label>Contacto:</label>
                  <span>{component.supplierContact || 'No especificado'}</span>
                </div>
                <div className="info-item">
                  <label>Veces usado:</label>
                  <span className="usage-count">{component.usageCount || 0}</span>
                </div>
                <div className="info-item">
                  <label>Creado:</label>
                  <span>{formatDate(component.createdAt)}</span>
                </div>
                <div className="info-item">
                  <label>Actualizado:</label>
                  <span>{formatDate(component.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="edit-btn" onClick={() => onEdit(component)}>
            ✏️ Editar Componente
          </button>
          <button className="close-modal-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComponentDetailModal;
