// src/components/ProductOptionSelector.jsx

import React from 'react';
import './ProductOptionSelector.css';

const ProductOptionSelector = ({ customization, selectedOption, onOptionSelect }) => {
  if (!customization || !customization.opciones || customization.opciones.length === 0) {
    return null;
  }

  const handleSelect = (option) => {
    // Si la opción clickeada ya está seleccionada, la deseleccionamos. Si no, la seleccionamos.
    const newSelection = selectedOption?.nombre === option.nombre ? null : option;
    onOptionSelect(newSelection);
  };

  return (
    <div className="option-selector-container">
      <label className="customization-label">{customization.label}</label>
      <div className="options-grid">
        {customization.opciones.map((option) => {
          const isSelected = selectedOption && selectedOption.nombre === option.nombre;
          return (
            <button
              key={option.nombre}
              className={`option-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelect(option)}
            >
              <span className="option-name">{option.nombre}</span>
              {/* Mostramos el precio completo de la variante */}
              <span className="option-price">S/ {option.precio.toFixed(2)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductOptionSelector;