// src/components/MaterialSelector.jsx

import React from 'react';
import './MaterialSelector.css'; // Crearemos este archivo de estilos a continuación

const MaterialSelector = ({ materialOptions, selectedOption, onOptionSelect }) => {
  if (!materialOptions || !materialOptions.opciones || materialOptions.opciones.length === 0) {
    return null;
  }

  return (
    <div className="material-selector-container">
      <label className="customization-label">{materialOptions.label}</label>
      <div className="options-grid">
        {materialOptions.opciones.map((option) => {
          const isSelected = selectedOption && selectedOption.nombre === option.nombre;
          return (
            <button
              key={option.nombre}
              className={`material-option-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => onOptionSelect(option)}
            >
              <span className="material-name">{option.nombre}</span>
              {option.ajustePrecio > 0 && (
                <span className="price-adjustment">(+ S/ {option.ajustePrecio.toFixed(2)})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MaterialSelector;