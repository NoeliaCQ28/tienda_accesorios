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
    images: []
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
      calculatedPrice: formData.costPrice * (1 + formData.suggestedMargin / 100)
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

          {/* Inventario y precios */}
          <div className="form-section">
            <h4>Inventario y Precios</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Stock Actual</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Stock Mínimo</label>
                <input
                  type="number"
                  name="minStock"
                  value={formData.minStock}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Precio de Costo (S/)</label>
                <input
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Margen Sugerido (%)</label>
                <input
                  type="number"
                  name="suggestedMargin"
                  value={formData.suggestedMargin}
                  onChange={handleChange}
                  min="0"
                  max="300"
                />
              </div>
            </div>
            {formData.costPrice > 0 && (
              <div className="price-preview">
                Precio sugerido: S/ {(formData.costPrice * (1 + formData.suggestedMargin / 100)).toFixed(2)}
              </div>
            )}
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
