// src/components/ComponentSelector.jsx

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './ComponentSelector.css';

const ComponentSelector = ({ 
  selectedComponents, 
  componentPrices, 
  componentQuantities = {},
  allowMultiple, 
  filterByType,
  onComponentToggle,
  onPriceChange,
  onQuantityChange,
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

  // Funciones para manejar cantidades
  const getComponentQuantity = (component) => {
    return componentQuantities[component.id] || component.cantidadMinima || 1;
  };

  const handleQuantityChange = (componentId, value) => {
    const component = components.find(c => c.id === componentId);
    if (!component) return;

    // Asegurar que la cantidad respeta los mínimos e incrementos
    const min = component.cantidadMinima || 1;
    const increment = component.incremento || 1;
    
    // Normalizar al incremento más cercano
    const normalized = Math.round(value / increment) * increment;
    const finalValue = Math.max(min, normalized);
    
    if (onQuantityChange) {
      onQuantityChange(componentId, finalValue);
    }
  };

  const incrementQuantity = (componentId) => {
    const component = components.find(c => c.id === componentId);
    const current = getComponentQuantity(component);
    const increment = component.incremento || 1;
    handleQuantityChange(componentId, current + increment);
  };

  const decrementQuantity = (componentId) => {
    const component = components.find(c => c.id === componentId);
    const current = getComponentQuantity(component);
    const increment = component.incremento || 1;
    const min = component.cantidadMinima || 1;
    const newValue = Math.max(min, current - increment);
    handleQuantityChange(componentId, newValue);
  };

  const getUnitDisplay = (unit) => {
    if (unit === 'gramo') return 'g';
    if (unit === 'metro') return 'm';
    return 'und';
  };

  // Nuevas funciones para manejo de unidades duales
  const getUsageUnitDisplay = (component) => {
    const usageUnit = component.unidadDeUso || component.unidadMedida || 'unidad';
    return getUnitDisplay(usageUnit);
  };

  const getInventoryUnitDisplay = (component) => {
    return getUnitDisplay(component.unidadMedida || 'unidad');
  };

  // Calcular cantidad en unidades de inventario basado en cantidad de uso
  const calculateInventoryQuantity = (component, usageQuantity) => {
    if (!component.unidadDeUso || component.unidadMedida === component.unidadDeUso) {
      return usageQuantity;
    }
    
    const equivalence = component.equivalenciaUso || 1;
    return usageQuantity / equivalence;
  };

  // Calcular el costo total considerando el sistema dual
  const calculateTotalCost = (component, usageQuantity) => {
    const inventoryQuantity = calculateInventoryQuantity(component, usageQuantity);
    const pricePerInventoryUnit = getComponentPrice(component);
    return inventoryQuantity * pricePerInventoryUnit;
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
                    <div className="component-config">
                      {/* Selector de cantidad - usando unidades de uso */}
                      {(component.unidadDeUso || component.unidadMedida) !== 'unidad' && (
                        <div className="quantity-config">
                          <div className="quantity-label">
                            <label>Cantidad ({getUsageUnitDisplay(component)}):</label>
                            {component.unidadDeUso && component.unidadMedida !== component.unidadDeUso && (
                              <small className="inventory-info">
                                Consume: {calculateInventoryQuantity(component, getComponentQuantity(component)).toFixed(2)} {getInventoryUnitDisplay(component)} del inventario
                              </small>
                            )}
                          </div>
                          <div className="quantity-controls">
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                decrementQuantity(component.id);
                              }}
                              className="quantity-btn minus"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={getComponentQuantity(component)}
                              onChange={(e) => handleQuantityChange(component.id, parseFloat(e.target.value) || component.cantidadMinima)}
                              onClick={(e) => e.stopPropagation()}
                              step={component.incremento || 1}
                              min={component.cantidadMinima || 1}
                              max={component.stock}
                              className="quantity-input"
                            />
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                incrementQuantity(component.id);
                              }}
                              className="quantity-btn plus"
                              disabled={getComponentQuantity(component) >= component.stock}
                            >
                              +
                            </button>
                          </div>
                          <small className="quantity-hint">
                            Min: {component.cantidadMinima} | Paso: {component.incremento} | Max: {component.stock}
                          </small>
                        </div>
                      )}

                      {/* Configuración de precio */}
                      <div className="price-config">
                        <label>Precio de venta (S/):</label>
                        <div className="price-input-group">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={currentPrice}
                            onChange={(e) => onPriceChange(component.id, parseFloat(e.target.value) || 0)}
                            onClick={(e) => e.stopPropagation()}
                            className="price-input"
                          />
                          <span className="price-unit">
                            por {getInventoryUnitDisplay(component)}
                            {component.unidadDeUso && component.unidadMedida !== component.unidadDeUso && (
                              <small> (inventario)</small>
                            )}
                          </span>
                        </div>
                        
                        {/* Mostrar precio total usando el cálculo dual */}
                        {(component.unidadDeUso || component.unidadMedida) !== 'unidad' && (
                          <div className="pricing-breakdown">
                            <div className="usage-cost">
                              Costo por uso: S/ {(calculateTotalCost(component, getComponentQuantity(component))).toFixed(2)}
                              <small>({getComponentQuantity(component)} {getUsageUnitDisplay(component)})</small>
                            </div>
                            {component.unidadDeUso && component.unidadMedida !== component.unidadDeUso && (
                              <div className="inventory-cost">
                                <small>
                                  Equivale a {calculateInventoryQuantity(component, getComponentQuantity(component)).toFixed(2)} {getInventoryUnitDisplay(component)} × S/ {currentPrice.toFixed(2)}
                                </small>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Botón para usar precio sugerido */}
                        {component.calculatedPrice && component.calculatedPrice !== currentPrice && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPriceChange(component.id, component.calculatedPrice);
                            }}
                            className="use-suggested-btn"
                          >
                            Usar sugerido (S/ {component.calculatedPrice.toFixed(2)})
                          </button>
                        )}
                        
                        {component.costPrice && (
                          <small className="cost-hint">
                            Costo: S/ {component.costPrice.toFixed(2)}
                          </small>
                        )}
                      </div>

                      {/* Vista especial para pastillas */}
                      {component.type === 'pastilla' && (
                        <div className="pastilla-preview">
                          <div 
                            className="pastilla-mini"
                            style={{
                              backgroundColor: component.colorFondo || '#CCCCCC'
                            }}
                          >
                            <div 
                              className="pastilla-mini-interior"
                              style={{
                                backgroundColor: component.colorInterior || '#FFFFFF'
                              }}
                            ></div>
                            {component.luminiscente && (
                              <div className="pastilla-mini-glow"></div>
                            )}
                          </div>
                          {component.luminiscente && (
                            <span className="luminescent-badge">✨ Luminiscente</span>
                          )}
                        </div>
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
