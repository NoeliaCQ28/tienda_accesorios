// src/pages/admin/components/ComponentForm.jsx

import React, { useState, useEffect } from 'react';
import './ComponentForm.css';

const ComponentForm = ({ component, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    subtype: '',
    color: '#000000',
    colorName: '',
    sku: '',
    stock: 0,
    minStock: 5,
    costPrice: 0,
    suggestedMargin: 50,
    supplier: '',
    supplierContact: '',
    description: '',
    tags: '',
    images: [],
    // Nuevos campos para unidades de medida
    unidadMedida: 'unidad', // Para inventario y costos
    unidadDeUso: 'unidad',  // Para uso en productos
    cantidadMinima: 1,
    incremento: 1,
    // Equivalencia entre unidades
    equivalenciaUso: 1, // Cuántas unidades de uso equivalen a 1 unidad de inventario
    // Nuevos campos para pastillas
    colorFondo: '#FFFFFF',
    colorInterior: '#000000',
    colorNombreFondo: '',
    colorNombreInterior: '',
    luminiscente: false,
    // Nuevos campos para precios
    finalPrice: 0,
    calculatedPrice: 0
  });

  const [errors, setErrors] = useState({});
  const [previewImages, setPreviewImages] = useState([]);

  // Tipos predefinidos con subtipos
  const componentTypes = {
    murano: ['corazón', 'redondo', 'cuadrado', 'gota', 'estrella', 'flor'],
    dije: ['metal', 'resina', 'piedra', 'cristal', 'madera'],
    hilo: ['chino', 'encerado', 'elástico', 'nylon', 'algodón'],
    perla: ['natural', 'cultivada', 'sintética', 'barroca'],
    cadena: ['oro', 'plata', 'acero', 'fantasía'],
    cierre: ['mosquetón', 'magnético', 'rosca', 'presión'],
    separador: ['metal', 'silicona', 'cristal', 'madera'],
    pastilla: ['básica', 'premium', 'especial', 'miniatura'],
    otro: ['accesorio', 'herramienta', 'material']
  };

  const colorPalette = [
    { name: 'Rojo', value: '#FF0000' },
    { name: 'Azul', value: '#0000FF' },
    { name: 'Verde', value: '#00FF00' },
    { name: 'Amarillo', value: '#FFFF00' },
    { name: 'Rosa', value: '#FFC0CB' },
    { name: 'Morado', value: '#800080' },
    { name: 'Naranja', value: '#FFA500' },
    { name: 'Negro', value: '#000000' },
    { name: 'Blanco', value: '#FFFFFF' },
    { name: 'Gris', value: '#808080' },
    { name: 'Marrón', value: '#8B4513' },
    { name: 'Dorado', value: '#FFD700' },
    { name: 'Plateado', value: '#C0C0C0' },
    { name: 'Turquesa', value: '#40E0D0' }
  ];

  useEffect(() => {
    if (component) {
      setFormData({
        ...component,
        tags: Array.isArray(component.tags) ? component.tags.join(', ') : (component.tags || ''),
        images: component.images || []
      });
      setPreviewImages(component.images || []);
    }
  }, [component]);

  useEffect(() => {
    if (formData.type === 'pastilla') {
      setFormData(prev => ({
        ...prev,
        equivalenciaUso: 800 / 100 // 800 pastillas por 100 gramos
      }));
    }
  }, [formData.type]);

  // Generar SKU automático
  const generateSKU = () => {
    const typeCode = formData.type.substring(0, 3).toUpperCase();
    const subtypeCode = formData.subtype.substring(0, 2).toUpperCase();
    const colorCode = formData.colorName.substring(0, 2).toUpperCase();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `${typeCode}${subtypeCode}${colorCode}${randomNum}`;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = type === 'number' ? parseFloat(value) || 0 : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-generar SKU cuando cambian ciertos campos
    if (['type', 'subtype', 'colorName'].includes(name) && 
        formData.type && formData.subtype && formData.colorName) {
      setFormData(prev => ({
        ...prev,
        sku: generateSKU()
      }));
    }
  };

  // Función para calcular precio sugerido
  const calculateSuggestedPrice = () => {
    const cost = parseFloat(formData.costPrice) || 0;
    const margin = parseFloat(formData.suggestedMargin) || 0;
    return cost * (1 + margin / 100);
  };

  // Función para calcular margen real
  const calculateActualMargin = () => {
    const cost = parseFloat(formData.costPrice) || 0;
    const final = parseFloat(formData.finalPrice) || 0;
    if (cost === 0) return 0;
    return ((final - cost) / cost) * 100;
  };

  // Función para obtener clase CSS del margen
  const getMarginClassName = () => {
    const actualMargin = calculateActualMargin();
    const suggestedMargin = parseFloat(formData.suggestedMargin) || 0;
    
    if (actualMargin < suggestedMargin - 10) return 'margin-low';
    if (actualMargin > suggestedMargin + 10) return 'margin-high';
    return 'margin-good';
  };

  // Función para obtener estado del margen
  const getMarginStatus = () => {
    const actualMargin = calculateActualMargin();
    const suggestedMargin = parseFloat(formData.suggestedMargin) || 0;
    
    if (actualMargin < suggestedMargin - 10) return 'Bajo';
    if (actualMargin > suggestedMargin + 10) return 'Alto';
    return 'Óptimo';
  };

  // Función para manejar cambios de precio
  const handlePricingChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    
    setFormData(prev => {
      const newData = { ...prev, [field]: numValue };
      
      // Auto-calcular precio sugerido cuando cambia costo o margen
      if (field === 'costPrice' || field === 'suggestedMargin') {
        const cost = field === 'costPrice' ? numValue : prev.costPrice;
        const margin = field === 'suggestedMargin' ? numValue : prev.suggestedMargin;
        newData.calculatedPrice = cost * (1 + margin / 100);
        
        // Si no hay precio final personalizado, usar el calculado
        if (!prev.finalPrice || prev.finalPrice === prev.calculatedPrice) {
          newData.finalPrice = newData.calculatedPrice;
        }
      }
      
      return newData;
    });
  };

  // Función para manejar cambios de unidad de medida
  const handleUnitChange = (e) => {
    const unit = e.target.value;
    let defaultUnitOfUse = 'unidad';
    let defaultEquivalence = 1;
    
    // Configuraciones por defecto según el tipo y unidad con equivalencias realistas
    if (unit === 'gramo') {
      // Para materiales por gramo, definir unidad de uso según el tipo
      if (formData.type === 'pastilla') {
        defaultUnitOfUse = 'unidad';
        defaultEquivalence = 8; // 1 gramo = 8 pastillas (100g = 800 pastillas)
      } else if (formData.type === 'perla') {
        defaultUnitOfUse = 'unidad';
        defaultEquivalence = 5; // 1 gramo = 5 perlas aproximadamente
      } else if (formData.type === 'dije') {
        defaultUnitOfUse = 'unidad';
        defaultEquivalence = 2; // 1 gramo = 2 dijes pequeños aproximadamente
      } else if (formData.type === 'separador') {
        defaultUnitOfUse = 'unidad';
        defaultEquivalence = 10; // 1 gramo = 10 separadores pequeños
      } else {
        defaultUnitOfUse = 'gramo'; // Hilos, cadenas se siguen usando por gramo
        defaultEquivalence = 1;
      }
    } else if (unit === 'metro') {
      defaultUnitOfUse = 'metro'; // Hilos por metro
      defaultEquivalence = 1;
    }
    
    setFormData(prev => ({
      ...prev,
      unidadMedida: unit,
      unidadDeUso: defaultUnitOfUse,
      equivalenciaUso: defaultEquivalence,
      cantidadMinima: unit === 'gramo' ? 0.5 : unit === 'metro' ? 0.1 : 1,
      incremento: unit === 'gramo' ? 0.5 : unit === 'metro' ? 0.1 : 1
    }));
  };

  // Handler para cambio de unidad de uso
  const handleUnitOfUseChange = (e) => {
    const newUnitOfUse = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      unidadDeUso: newUnitOfUse,
      // Si la unidad de uso es igual a la de inventario, no necesita equivalencia
      equivalenciaUso: newUnitOfUse === prev.unidadMedida ? 1 : prev.equivalenciaUso
    }));
  };

  // Función para manejar cambios de entrada
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleColorSelect = (color) => {
    setFormData(prev => ({
      ...prev,
      color: color.value,
      colorName: color.name
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    
    if (previewImages.length + files.length > maxFiles) {
      alert(`Máximo ${maxFiles} imágenes permitidas`);
      return;
    }

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            file: file,
            url: e.target.result,
            name: file.name,
            isMain: previewImages.length === 0
          };
          setPreviewImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (imageId) => {
    setPreviewImages(prev => prev.filter(img => img.id !== imageId));
  };

  const setMainImage = (imageId) => {
    setPreviewImages(prev => 
      prev.map(img => ({
        ...img,
        isMain: img.id === imageId
      }))
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.type) newErrors.type = 'El tipo es requerido';
    if (!formData.color) newErrors.color = 'El color es requerido';
    if (formData.stock < 0) newErrors.stock = 'El stock no puede ser negativo';
    if (formData.costPrice < 0) newErrors.costPrice = 'El precio no puede ser negativo';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const dataToSave = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      images: previewImages,
      calculatedPrice: formData.costPrice * (1 + formData.suggestedMargin / 100),
      // Asegurar que los nuevos campos están incluidos
      unidadMedida: formData.unidadMedida || 'unidad',
      cantidadMinima: formData.cantidadMinima || 1,
      incremento: formData.incremento || 1,
      finalPrice: formData.finalPrice || formData.calculatedPrice || 0,
      // Campos específicos para pastillas
      ...(formData.type === 'pastilla' && {
        colorFondo: formData.colorFondo,
        colorInterior: formData.colorInterior,
        colorNombreFondo: formData.colorNombreFondo,
        colorNombreInterior: formData.colorNombreInterior,
        luminiscente: formData.luminiscente
      }),
      // Timestamp de actualización
      updatedAt: new Date()
    };

    onSave(dataToSave);
  };

  return (
    <div className="component-form-overlay">
      <div className="component-form-modal">
        <div className="form-header">
          <h3>{component ? 'Editar Componente' : 'Nuevo Componente'}</h3>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="component-form">
          {/* Información básica */}
          <div className="form-section">
            <h4>Información Básica</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre del Componente *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Ej: Murano Corazón Rojo"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Se genera automáticamente"
                />
              </div>

              <div className="form-group">
                <label>Tipo *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={errors.type ? 'error' : ''}
                >
                  <option value="">Seleccionar tipo</option>
                  {Object.keys(componentTypes).map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.type && <span className="error-text">{errors.type}</span>}
              </div>

              <div className="form-group">
                <label>Subtipo</label>
                <select
                  name="subtype"
                  value={formData.subtype}
                  onChange={handleChange}
                  disabled={!formData.type}
                >
                  <option value="">Seleccionar subtipo</option>
                  {formData.type && componentTypes[formData.type]?.map(subtype => (
                    <option key={subtype} value={subtype}>
                      {subtype.charAt(0).toUpperCase() + subtype.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Color */}
          <div className="form-section">
            <h4>Color</h4>
            <div className="color-section">
              <div className="color-palette">
                {colorPalette.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    className={`color-swatch ${formData.color === color.value ? 'selected' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorSelect(color)}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="color-custom">
                <label>Color personalizado:</label>
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="colorName"
                  value={formData.colorName}
                  onChange={handleChange}
                  placeholder="Nombre del color"
                />
              </div>
            </div>
          </div>

          {/* Unidad de medida */}
          <div className="form-section">
            <h4>Unidades de Medida</h4>
            <div className="unit-selection">
              <div className="unit-explanation">
                <p><strong>Inventario:</strong> Cómo se almacena y costea el material</p>
                <p><strong>Uso en productos:</strong> Cómo se cuenta al crear productos</p>
              </div>
              
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="unidadMedida"
                    value="unidad"
                    checked={formData.unidadMedida === 'unidad'}
                    onChange={handleUnitChange}
                  />
                  <span>Unidad</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="unidadMedida"
                    value="gramo"
                    checked={formData.unidadMedida === 'gramo'}
                    onChange={handleUnitChange}
                  />
                  <span>Gramo</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="unidadMedida"
                    value="metro"
                    checked={formData.unidadMedida === 'metro'}
                    onChange={handleUnitChange}
                  />
                  <span>Metro</span>
                </label>
              </div>
              
              {formData.unidadMedida !== 'unidad' && (
                <div className="unit-config">
                  <div className="form-group">
                    <label>Inventario - Cantidad mínima:</label>
                    <input 
                      type="number" 
                      step={formData.unidadMedida === 'gramo' ? 0.1 : 0.5} 
                      min={0.1}
                      value={formData.cantidadMinima} 
                      onChange={(e) => handleInputChange('cantidadMinima', parseFloat(e.target.value))} 
                    />
                    <span className="unit-label">{formData.unidadMedida}s</span>
                  </div>
                  <div className="form-group">
                    <label>Inventario - Incremento:</label>
                    <input 
                      type="number" 
                      step={0.1} 
                      min={0.1}
                      value={formData.incremento} 
                      onChange={(e) => handleInputChange('incremento', parseFloat(e.target.value))} 
                    />
                    <span className="unit-label">{formData.unidadMedida}s</span>
                  </div>
                  
                  {/* Configuración de unidad de uso */}
                  <div className="use-unit-config">
                    <h5>🎯 Configuración para Productos</h5>
                    <div className="form-group">
                      <label>Unidad de uso en productos:</label>
                      <select
                        value={formData.unidadDeUso}
                        onChange={handleUnitOfUseChange}
                        className="unit-select"
                      >
                        <option value="unidad">Unidad (piezas)</option>
                        <option value="gramo">Gramo</option>
                        <option value="metro">Metro</option>
                      </select>
                    </div>
                    
                    {formData.unidadMedida !== formData.unidadDeUso && (
                      <div className="form-group equivalence-config">
                        <div className="equivalence-header">
                          <h6>🔄 Configurar Equivalencia</h6>
                          <p>Define cuántas unidades de uso hay en 1 {formData.unidadMedida} de inventario</p>
                        </div>
                        
                        <div className="equivalence-input-group">
                          <span className="equivalence-label">1 {formData.unidadMedida} contiene</span>
                          <input 
                            type="number" 
                            step="0.1" 
                            min="0.1"
                            value={formData.equivalenciaUso} 
                            onChange={(e) => handleInputChange('equivalenciaUso', parseFloat(e.target.value))} 
                            className="equivalence-input"
                            placeholder="Ej: 8"
                          />
                          <span className="unit-label">{formData.unidadDeUso}s</span>
                        </div>
                        
                        {/* Presets de equivalencia común */}
                        <div className="equivalence-presets">
                          <span className="presets-label">Configuraciones comunes:</span>
                          <div className="preset-buttons">
                            {formData.type === 'pastilla' && (
                              <>
                                <button type="button" onClick={() => handleInputChange('equivalenciaUso', 8)} className="preset-btn">
                                  8 pastillas/g (estándar)
                                </button>
                                <button type="button" onClick={() => handleInputChange('equivalenciaUso', 10)} className="preset-btn">
                                  10 pastillas/g (pequeñas)
                                </button>
                                <button type="button" onClick={() => handleInputChange('equivalenciaUso', 6)} className="preset-btn">
                                  6 pastillas/g (grandes)
                                </button>
                              </>
                            )}
                            {formData.type === 'perla' && (
                              <>
                                <button type="button" onClick={() => handleInputChange('equivalenciaUso', 5)} className="preset-btn">
                                  5 perlas/g (medianas)
                                </button>
                                <button type="button" onClick={() => handleInputChange('equivalenciaUso', 3)} className="preset-btn">
                                  3 perlas/g (grandes)
                                </button>
                                <button type="button" onClick={() => handleInputChange('equivalenciaUso', 8)} className="preset-btn">
                                  8 perlas/g (pequeñas)
                                </button>
                              </>
                            )}
                            {formData.type === 'dije' && (
                              <>
                                <button type="button" onClick={() => handleInputChange('equivalenciaUso', 2)} className="preset-btn">
                                  2 dijes/g (medianos)
                                </button>
                                <button type="button" onClick={() => handleInputChange('equivalenciaUso', 1)} className="preset-btn">
                                  1 dije/g (grandes)
                                </button>
                                <button type="button" onClick={() => handleInputChange('equivalenciaUso', 4)} className="preset-btn">
                                  4 dijes/g (pequeños)
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="equivalence-example">
                          <div className="example-calculation">
                            <strong>💡 Ejemplo de uso:</strong>
                            <p>
                              Si necesitas {Math.min(3, Math.floor(formData.equivalenciaUso))} {formData.unidadDeUso}s para un producto,
                              consumirás <strong>{(Math.min(3, Math.floor(formData.equivalenciaUso)) / formData.equivalenciaUso).toFixed(2)} {formData.unidadMedida}s</strong> del inventario.
                            </p>
                            <p className="stock-example">
                              Con 100 {formData.unidadMedida}s de inventario, puedes hacer aproximadamente <strong>{Math.floor((100 * formData.equivalenciaUso) / Math.min(3, Math.floor(formData.equivalenciaUso)))} productos</strong>.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Configuración especial para pastillas */}
          {formData.type === 'pastilla' && (
            <div className="form-section">
              <h4>Configuración de Pastilla</h4>
              <div className="pastilla-config">
                <div className="color-selectors">
                  <div className="form-group">
                    <label>Color de fondo:</label>
                    <div className="color-input-group">
                      <input 
                        type="color" 
                        value={formData.colorFondo} 
                        onChange={(e) => handleInputChange('colorFondo', e.target.value)} 
                      />
                      <input 
                        type="text" 
                        value={formData.colorNombreFondo || ''} 
                        onChange={(e) => handleInputChange('colorNombreFondo', e.target.value)} 
                        placeholder="Nombre del color (ej: Azul marino)" 
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Color interior:</label>
                    <div className="color-input-group">
                      <input 
                        type="color" 
                        value={formData.colorInterior} 
                        onChange={(e) => handleInputChange('colorInterior', e.target.value)} 
                      />
                      <input 
                        type="text" 
                        value={formData.colorNombreInterior || ''} 
                        onChange={(e) => handleInputChange('colorNombreInterior', e.target.value)} 
                        placeholder="Nombre del color (ej: Blanco)" 
                      />
                    </div>
                  </div>
                </div>
                <div className="pastilla-preview">
                  <span>Vista previa:</span>
                  <div 
                    className="pastilla-sample"
                    style={{
                      backgroundColor: formData.colorFondo,
                      border: '2px solid #ccc'
                    }}
                  >
                    <div 
                      className="pastilla-interior"
                      style={{
                        backgroundColor: formData.colorInterior
                      }}
                    ></div>
                    {formData.luminiscente && <div className="pastilla-glow"></div>}
                  </div>
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={formData.luminiscente} 
                      onChange={(e) => handleInputChange('luminiscente', e.target.checked)} 
                    />
                    <span>Luminiscente (brilla en la oscuridad)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Inventario y precios */}
          <div className="form-section">
            <h4>Inventario</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Stock Actual</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    step={formData.unidadMedida !== 'unidad' ? formData.incremento : 1}
                  />
                  <span className="unit-display">{formData.unidadMedida !== 'unidad' ? formData.unidadMedida + 's' : 'unidades'}</span>
                </div>
              </div>

              <div className="form-group">
                <label>Stock Mínimo</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    name="minStock"
                    value={formData.minStock}
                    onChange={handleChange}
                    min="0"
                    step={formData.unidadMedida !== 'unidad' ? formData.incremento : 1}
                  />
                  <span className="unit-display">{formData.unidadMedida !== 'unidad' ? formData.unidadMedida + 's' : 'unidades'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cálculo de precios y márgenes */}
          <div className="form-section">
            <h4>Cálculo de Precios y Márgenes</h4>
            <div className="pricing-calculator">
              <div className="pricing-grid">
                <div className="form-group">
                  <label>Precio de costo por {formData.unidadMedida}:</label>
                  <div className="input-with-prefix">
                    <span>S/</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      value={formData.costPrice} 
                      onChange={(e) => handlePricingChange('costPrice', e.target.value)} 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Margen sugerido (%):</label>
                  <div className="input-with-suffix">
                    <input 
                      type="number" 
                      step="1" 
                      min="0" 
                      max="1000" 
                      value={formData.suggestedMargin} 
                      onChange={(e) => handlePricingChange('suggestedMargin', e.target.value)} 
                    />
                    <span>%</span>
                  </div>
                </div>
                <div className="form-group suggested-price">
                  <label>Precio sugerido:</label>
                  <div className="price-preview">
                    <span className="currency">S/</span>
                    <span className="amount">{calculateSuggestedPrice().toFixed(2)}</span>
                    <span className="per-unit">por {formData.unidadMedida}</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Precio final (personalizado):</label>
                  <div className="input-with-prefix">
                    <span>S/</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      value={formData.finalPrice} 
                      onChange={(e) => handlePricingChange('finalPrice', e.target.value)} 
                    />
                  </div>
                  <button 
                    type="button" 
                    className="use-suggested-btn"
                    onClick={() => handlePricingChange('finalPrice', calculateSuggestedPrice())}
                  >
                    Usar Sugerido
                  </button>
                </div>
                <div className="form-group actual-margin">
                  <label>Margen real:</label>
                  <div className="margin-preview">
                    <span className={`amount ${getMarginClassName()}`}>{calculateActualMargin().toFixed(2)}%</span>
                    <span className={`status ${getMarginClassName()}`}>
                      {getMarginStatus()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Proveedor */}
          <div className="form-section">
            <h4>Información del Proveedor</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Proveedor</label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  placeholder="Nombre del proveedor"
                />
              </div>

              <div className="form-group">
                <label>Contacto</label>
                <input
                  type="text"
                  name="supplierContact"
                  value={formData.supplierContact}
                  onChange={handleChange}
                  placeholder="Teléfono, email, etc."
                />
              </div>
            </div>
          </div>

          {/* Descripción y tags */}
          <div className="form-section">
            <h4>Detalles Adicionales</h4>
            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Descripción detallada del componente..."
              />
            </div>

            <div className="form-group">
              <label>Etiquetas</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="brillante, elegante, verano (separar con comas)"
              />
            </div>
          </div>

          {/* Imágenes */}
          <div className="form-section">
            <h4>Imágenes</h4>
            <div className="image-upload">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="upload-label">
                📸 Subir imágenes (máx. 5)
              </label>
            </div>
            
            {previewImages.length > 0 && (
              <div className="image-preview">
                {previewImages.map(image => (
                  <div key={image.id} className="preview-item">
                    <img src={image.url} alt={image.name} />
                    <div className="image-actions">
                      <button
                        type="button"
                        onClick={() => setMainImage(image.id)}
                        className={`main-btn ${image.isMain ? 'active' : ''}`}
                      >
                        {image.isMain ? '⭐' : '☆'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="remove-btn"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              {component ? 'Actualizar' : 'Crear'} Componente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComponentForm;
