// src/pages/admin/components/ComponentTable.jsx

import React, { useState } from 'react';
import ComponentDetailModal from './ComponentDetailModal';
import './ComponentTable.css';

const ComponentTable = ({ components, onEdit, onDelete }) => {
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedComponentForDetail, setSelectedComponentForDetail] = useState(null);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedComponents([]);
    } else {
      setSelectedComponents(components.map(c => c.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectComponent = (componentId) => {
    setSelectedComponents(prev => 
      prev.includes(componentId) 
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    );
  };

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

  // Funciones para el modal de detalles
  const handleViewDetails = (component) => {
    setSelectedComponentForDetail(component);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedComponentForDetail(null);
  };

  const handleEditFromModal = (component) => {
    closeDetailModal();
    onEdit(component);
  };

  return (
    <div className="component-table-container">
      {selectedComponents.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedComponents.length} componente(s) seleccionado(s)</span>
          <button className="bulk-btn bulk-edit">Editar en lote</button>
          <button className="bulk-btn bulk-delete">Eliminar seleccionados</button>
        </div>
      )}

      <div className="table-wrapper">
        <table className="component-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="image-col">Imagen</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Color</th>
              <th>SKU</th>
              <th>Stock</th>
              <th>Precio</th>
              <th>Usos</th>
              <th>Creado</th>
              <th className="actions-col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {components.map(component => (
              <tr key={component.id} className="component-row">
                <td className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectedComponents.includes(component.id)}
                    onChange={() => handleSelectComponent(component.id)}
                  />
                </td>
                
                <td className="image-col">
                  <div className="component-image">
                    {component.images && component.images.length > 0 ? (
                      <img 
                        src={component.images.find(img => img.isMain)?.url || component.images[0].url} 
                        alt={component.name}
                      />
                    ) : (
                      <div 
                        className="color-indicator"
                        style={{ backgroundColor: component.color }}
                        title={`Color: ${component.colorName || component.color}`}
                      />
                    )}
                  </div>
                </td>

                <td className="name-col">
                  <div className="component-name">
                    <span className="name">{component.name}</span>
                    {component.description && (
                      <span className="description">{component.description}</span>
                    )}
                  </div>
                </td>

                <td className="type-col">
                  <div className="type-info">
                    <span className="type">{component.type}</span>
                    {component.subtype && (
                      <span className="subtype">{component.subtype}</span>
                    )}
                  </div>
                </td>

                <td className="color-col">
                  <div className="color-info">
                    <div 
                      className="color-circle"
                      style={{ backgroundColor: component.color }}
                    />
                    <span>{component.colorName || component.color}</span>
                  </div>
                </td>

                <td className="sku-col">
                  <code className="sku">{component.sku || 'N/A'}</code>
                </td>

                <td className="stock-col">
                  <div className={`stock-info ${getStockStatus(component.stock, component.minStock)}`}>
                    <span className="stock-number">{component.stock || 0}</span>
                    <span className="stock-status">
                      {getStockStatusText(component.stock, component.minStock)}
                    </span>
                  </div>
                </td>

                <td className="price-col">
                  <div className="price-info">
                    {component.costPrice > 0 && (
                      <>
                        <span className="cost-price">Costo: S/ {component.costPrice.toFixed(2)}</span>
                        {component.calculatedPrice && (
                          <span className="sell-price">Venta: S/ {component.calculatedPrice.toFixed(2)}</span>
                        )}
                      </>
                    )}
                  </div>
                </td>

                <td className="usage-col">
                  <span className="usage-count">{component.usageCount || 0}</span>
                </td>

                <td className="date-col">
                  <span className="date">{formatDate(component.createdAt)}</span>
                </td>

                <td className="actions-col">
                  <div className="action-buttons">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEdit(component)}
                      title="Editar componente"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => onDelete(component.id)}
                      title="Eliminar componente"
                    >
                      🗑️
                    </button>
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleViewDetails(component)}
                      title="Ver detalles del componente"
                    >
                      👁️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {components.length === 0 && (
        <div className="table-empty">
          <p>No hay componentes para mostrar</p>
        </div>
      )}

      {/* Modal de detalles */}
      {showDetailModal && (
        <ComponentDetailModal
          component={selectedComponentForDetail}
          onClose={closeDetailModal}
          onEdit={handleEditFromModal}
        />
      )}
    </div>
  );
};

export default ComponentTable;
