// src/components/MuranoColorSelector.jsx

import React, { useState, useEffect } from 'react';
import { muranoCatalog } from '../data/muranoCatalog';
import './MuranoColorSelector.css';

const MuranoColorSelector = ({ onColorChange, defaultSize = 8, showSizeSelector = true }) => {
  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedTone, setSelectedTone] = useState(null);

  // Tamaños disponibles sin precios
  const MURANO_SIZES = {
    3: { size: '#3', diameter: '6mm', name: 'Pequeño' },
    4: { size: '#4', diameter: '8mm', name: 'Mediano Pequeño' },
    6: { size: '#6', diameter: '10mm', name: 'Mediano' },
    8: { size: '#8', diameter: '12mm', name: 'Grande' }
  };

  useEffect(() => {
    // Resetear selecciones cuando cambia el tamaño
    setSelectedFamily(null);
    setSelectedTone(null);
    onColorChange(null);
  }, [selectedSize]);

  useEffect(() => {
    onColorChange(null); // Inicialmente sin selección
  }, []);

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleFamilySelect = (familyKey) => {
    setSelectedFamily(familyKey);
    setSelectedTone(null);
    onColorChange(null);
  };

  const handleToneSelect = (tone) => {
    const fullSelection = {
      id: tone.id,
      name: tone.name,
      color: tone.color,
      size: selectedSize,
      sizeInfo: MURANO_SIZES[selectedSize],
      fullName: `${tone.name} #${selectedSize}`
    };
    
    setSelectedTone(fullSelection);
    onColorChange(fullSelection);
  };

  const getSizeDisplayClass = (size) => {
    const sizeNum = parseInt(size);
    if (sizeNum <= 3) return 'size-small';
    if (sizeNum <= 4) return 'size-medium-small';
    if (sizeNum <= 6) return 'size-medium';
    return 'size-large';
  };

  return (
    <div className="murano-selector-container">
      {/* Selector de Tamaño */}
      {showSizeSelector && (
        <div className="size-picker-container">
          <h3>1. Elige el tamaño del murano:</h3>
          <div className="size-buttons">
            {Object.entries(MURANO_SIZES).map(([size, config]) => (
              <button
                key={size}
                onClick={() => handleSizeSelect(parseInt(size))}
                className={`size-btn ${selectedSize === parseInt(size) ? 'active' : ''} ${getSizeDisplayClass(size)}`}
                title={`${config.name} - ${config.diameter}`}
              >
                <div className="size-visual">
                  <div className={`size-circle ${getSizeDisplayClass(size)}`}></div>
                </div>
                <div className="size-info">
                  <span className="size-number">{config.size}</span>
                  <span className="size-diameter">{config.diameter}</span>
                  <span className="size-name">{config.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selector de Familia de Colores */}
      <div className="family-picker-container">
        <h3>{showSizeSelector ? '2.' : '1.'} Elige una familia de colores:</h3>
        <div className="family-buttons">
          {Object.entries(muranoCatalog).map(([key, family]) => (
            <button
              key={key}
              onClick={() => handleFamilySelect(key)}
              className={`family-btn ${selectedFamily === key ? 'active' : ''}`}
            >
              {family.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de Color Específico */}
      {selectedFamily && (
        <div className="tone-picker-container">
          <h3>{showSizeSelector ? '3.' : '2.'} Selecciona el color específico:</h3>
          <div className="tone-grid">
            {muranoCatalog[selectedFamily].tones.map((tone) => (
              <div key={tone.id} className="tone-item">
                <button
                  onClick={() => handleToneSelect(tone)}
                  className={`tone-btn ${selectedTone?.id === tone.id ? 'active' : ''}`}
                  style={{ 
                    backgroundColor: tone.color,
                    background: tone.color.includes('gradient') ? tone.color : tone.color
                  }}
                  title={tone.name}
                >
                  <div className={`murano-size-indicator ${getSizeDisplayClass(selectedSize)}`}></div>
                </button>
                <span className="tone-name">{tone.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vista Previa de la Selección */}
      {selectedTone && (
        <div className="color-preview-container">
          <div className="preview-visual">
            <div 
              className={`color-preview-dot ${getSizeDisplayClass(selectedSize)}`}
              style={{ 
                backgroundColor: selectedTone.color,
                background: selectedTone.color?.includes('gradient') ? selectedTone.color : selectedTone.color
              }}
            ></div>
          </div>
          <div className="preview-info">
            <p className="color-preview-text">
              <strong>Seleccionado:</strong> {selectedTone.fullName}
            </p>
            <p className="preview-details">
              Tamaño: {MURANO_SIZES[selectedSize]?.diameter} ({MURANO_SIZES[selectedSize]?.name})
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuranoColorSelector;
