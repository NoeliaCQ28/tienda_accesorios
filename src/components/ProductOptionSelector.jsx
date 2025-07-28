// src/components/ProductOptionSelector.jsx

import React from 'react';
import './ProductOptionSelector.css';

const ProductOptionSelector = ({ customization, selectedOption, onOptionSelect }) => {
  if (!customization || !customization.opciones || customization.opciones.length === 0) {
    return null;
  }

  // Normalizamos las opciones. Si es un array de strings, lo convertimos en un array de objetos.
  const isSimpleSelector = typeof customization.opciones[0] === 'string';
  const options = isSimpleSelector
    ? customization.opciones.map(opt => ({ nombre: opt }))
    : customization.opciones;

  const handleSelect = (option) => {
    // Para selectores simples, el valor a seleccionar es solo el string.
    // Para selectores de material, es el objeto de opción completo.
    const valueToSelect = isSimpleSelector ? option.nombre : option;

    // Comprobamos si la opción en la que se hace clic es la que ya está seleccionada.
    let isCurrentlySelected;
    if (isSimpleSelector) {
        isCurrentlySelected = selectedOption === option.nombre;
    } else {
        isCurrentlySelected = selectedOption?.nombre === option.nombre;
    }

    // Si ya está seleccionada, la deseleccionamos (pasando null). Si no, seleccionamos el nuevo valor.
    const newSelection = isCurrentlySelected ? null : valueToSelect;
    onOptionSelect(newSelection);
  };

  return (
    <div className="option-selector-container">
      <label className="customization-label">{customization.label}</label>
      <div className="options-grid">
        {options.map((option) => {
          // Determinamos si la opción actual está seleccionada
          const isSelected = isSimpleSelector
            ? selectedOption === option.nombre
            : selectedOption?.nombre === option.nombre;
            
          return (
            <button
              key={option.nombre}
              className={`option-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelect(option)}
            >
              <span className="option-name">{option.nombre}</span>
              {/* Renderizamos el precio condicionalmente solo si existe */}
              {option.precio !== undefined && (
                <span className="option-price">S/ {option.precio.toFixed(2)}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductOptionSelector;
