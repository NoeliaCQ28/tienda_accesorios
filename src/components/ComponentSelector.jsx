// src/components/ComponentSelector.jsx

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './ComponentSelector.css';

const ComponentSelector = ({ 
  selectedComponents, 
  componentPrices, 
  allowMultiple, 
  filterByType,
  onComponentToggle,
  onPriceChange,
  onConfigChange
}) => {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState(filterByType || '');
  
  // Cargar componentes desde Firebase
  useEffect(() => {
    const loadComponents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'components'));
        const componentsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setComponents(componentsData);
      } catch (error) {
        console.error('Error al cargar componentes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComponents();
  }, []);

  // Filtrar componentes
  const filteredComponents = components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || component.type === typeFilter;
    const hasStock = (component.stock || 0) > 0; // Solo mostrar componentes con stock
    return matchesSearch && matchesType && hasStock;
  });

  // Obtener tipos únicos para el filtro
  const uniqueTypes = [...new Set(components.map(c => c.type))].sort();

  const handleComponentToggle = (componentId) => {
    if (!allowMultiple) {
      // Si no permite múltiples, deseleccionar otros y seleccionar este
      onComponentToggle([componentId]);
    } else {
      // Si permite múltiples, agregar/quitar de la lista
      const newSelected = selectedComponents.includes(componentId)
        ? selectedComponents.filter(id => id !== componentId)
        : [...selectedComponents, componentId];
      onComponentToggle(newSelected);
    }
  };

  const getComponentPrice = (component) => {
    return componentPrices[component.id] || component.calculatedPrice || component.costPrice || 0;
  };

  if (loading) {
    return (
      <div className="component-selector">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando componentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="component-selector">
      <div className="selector-header">
        <h5>Seleccionar Componentes</h5>
        <div className="selector-config">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={(e) => onConfigChange('allowMultiple', e.target.checked)}
            />
            <span>Permitir selección múltiple</span>
          </label>
        </div>
      </div>

      <div className="selector-filters">
        <div className="search-group">
          <input
            type="text"
            placeholder="Buscar componentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              onConfigChange('filterByType', e.target.value);
            }}
            className="type-filter"
          >
            <option value="">Todos los tipos</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredComponents.length === 0 ? (
        <div className="empty-state">
          <p>No se encontraron componentes disponibles</p>
          <small>Verifica los filtros o agrega componentes en el gestor</small>
        </div>
      ) : (
        <div className="components-grid">
          {filteredComponents.map(component => {
            const isSelected = selectedComponents.includes(component.id);
            const currentPrice = getComponentPrice(component);
            
            return (
              <div 
                key={component.id} 
                className={`component-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleComponentToggle(component.id)}
              >
                <div className="card-header">
                  <div className="component-image">
                    {component.images && component.images.length > 0 ? (
                      <img 
                        src={component.images.find(img => img.isMain)?.url || component.images[0].url} 
                        alt={component.name}
                      />
                    ) : (
                      <div 
                        className="color-placeholder"
                        style={{ backgroundColor: component.color }}
                        title={`Color: ${component.colorName || component.color}`}
                      />
                    )}
                  </div>
                  
                  <div className="selection-indicator">
                    {isSelected ? '✓' : ''}
                  </div>
                </div>

                <div className="card-body">
                  <h6 className="component-name">{component.name}</h6>
                  
                  <div className="component-info">
                    <span className="component-type">
                      {component.type}
                      {component.subtype && ` • ${component.subtype}`}
                    </span>
                    
                    <div className="component-color">
                      <div 
                        className="color-dot"
                        style={{ backgroundColor: component.color }}
                      />
                      <span>{component.colorName || component.color}</span>
                    </div>

                    <div className="stock-info">
                      Stock: {component.stock || 0}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="price-config">
                      <label>Precio de venta (S/):</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={currentPrice}
                        onChange={(e) => onPriceChange(component.id, parseFloat(e.target.value) || 0)}
                        onClick={(e) => e.stopPropagation()}
                        className="price-input"
                      />
                      {component.costPrice && (
                        <small className="cost-hint">
                          Costo: S/ {component.costPrice.toFixed(2)}
                        </small>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedComponents.length > 0 && (
        <div className="selection-summary">
          <h6>Componentes seleccionados: {selectedComponents.length}</h6>
          <div className="selected-list">
            {selectedComponents.map(componentId => {
              const component = components.find(c => c.id === componentId);
              if (!component) return null;
              
              return (
                <div key={componentId} className="selected-item">
                  <span className="item-name">{component.name}</span>
                  <span className="item-price">S/ {getComponentPrice(component).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentSelector;
