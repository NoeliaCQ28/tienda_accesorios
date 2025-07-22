// src/components/ProductColorSelector.jsx

import React, { useState, useEffect } from 'react';
import { colorCatalog } from '../data/colorCatalog';

const ProductColorSelector = ({ product, onColorChange }) => {
  const [useCustom, setUseCustom] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedTone, setSelectedTone] = useState(null);

  // --- INICIO DE LA MODIFICACIÓN ---
  // Cuando el componente se monta por primera vez, si hay pulseras,
  // la opción por defecto es mantener los colores originales.
  useEffect(() => {
    onColorChange('original');
  }, []);

  const handleToggleCustom = (isCustom) => {
    setUseCustom(isCustom);
    if (!isCustom) {
      setSelectedFamily(null);
      setSelectedTone(null);
      // Cuando se elige "Mantener Colores", enviamos la señal 'original'
      onColorChange('original');
    } else {
      // Cuando se activa "Personalizar", volvemos al estado indefinido (null)
      // para forzar al usuario a elegir un tono.
      onColorChange(null);
    }
  };

  const handleFamilySelect = (familyKey) => {
    setSelectedFamily(familyKey);
    setSelectedTone(null);
    // Mientras no se elija un tono, la selección es indefinida (null)
    onColorChange(null);
  };
  // --- FIN DE LA MODIFICACIÓN ---

  const handleToneSelect = (tone) => {
    setSelectedTone(tone);
    onColorChange({
      name: tone.name,
      color: tone.color,
    });
  };

  return (
    <div className="color-selector-container">
      <div className="color-toggle-container">
        <button
          onClick={() => handleToggleCustom(false)}
          className={`color-toggle-btn ${!useCustom ? 'active default' : ''}`}
        >
          Mantener Colores Originales
        </button>
        <button
          onClick={() => handleToggleCustom(true)}
          className={`color-toggle-btn ${useCustom ? 'active custom' : ''}`}
        >
          ✨ Personalizar Color
        </button>
      </div>

      {useCustom && (
        <div className="customization-box">
          <div className="family-picker-container">
            <h3>1. Elige una familia de colores:</h3>
            <div className="family-buttons">
              {Object.entries(colorCatalog).map(([key, family]) => (
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

          {selectedFamily && (
            <div className="tone-picker-container">
              <h3>2. Selecciona el tono:</h3>
              <div className="tone-grid">
                {colorCatalog[selectedFamily].tones.map((tone) => (
                  <div key={tone.id} className="tone-item">
                    <button
                      onClick={() => handleToneSelect(tone)}
                      className={`tone-btn ${selectedTone?.id === tone.id ? 'active' : ''}`}
                      style={{ background: tone.color, border: tone.color === '#FFFFFF' ? '1px solid #ddd' : 'none' }}
                      aria-label={`Seleccionar color ${tone.name}`}
                    />
                    <span className="tone-name">{tone.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductColorSelector;