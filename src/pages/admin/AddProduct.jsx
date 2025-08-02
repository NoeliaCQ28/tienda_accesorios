// src/pages/admin/AddProduct.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import '../Admin.css';
import './Customizations.css';

const AddProduct = () => {
  const navigate = useNavigate();
  
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [tags, setTags] = useState('');
  const [personalizaciones, setPersonalizaciones] = useState([]);

  const addPersonalizacion = () => {
    setPersonalizaciones([
      ...personalizaciones,
      {
        id: Date.now(),
        tipo: '', // Forzar al admin a elegir un tipo
        label: '',
        // Atributos para cada tipo
        opciones: [{ id: Date.now(), nombre: '', precio: 0 }], // Para 'material'
        opcionesFijas: '', // Para 'selector' (se guardan como string separado por comas)
        maxLength: 20, // Para 'texto'
      },
    ]);
  };

  const removePersonalizacion = (id) => {
    setPersonalizaciones(personalizaciones.filter((p) => p.id !== id));
  };

  const handlePersonalizacionChange = (id, field, value) => {
    const newPersonalizaciones = personalizaciones.map((p) => {
      if (p.id === id) {
        let updatedP = { ...p, [field]: value };
        // Si cambia el tipo, reseteamos los valores de los otros tipos para evitar datos basura
        if (field === 'tipo') {
          updatedP.opciones = [{ id: Date.now(), nombre: '', precio: 0 }];
          updatedP.opcionesFijas = '';
          updatedP.maxLength = 20;
        }
        return updatedP;
      }
      return p;
    });
    setPersonalizaciones(newPersonalizaciones);
  };

  const handleOptionChange = (pId, optionId, field, value) => {
    setPersonalizaciones(personalizaciones.map(p => {
      if (p.id === pId) {
        const newOptions = p.opciones.map(opt => {
          if (opt.id === optionId) {
            const finalValue = field === 'precio' ? parseFloat(value) || 0 : value;
            return { ...opt, [field]: finalValue };
          }
          return opt;
        });
        return { ...p, opciones: newOptions };
      }
      return p;
    }));
  };

  const addOption = (pId) => {
    setPersonalizaciones(personalizaciones.map(p => p.id === pId ? { ...p, opciones: [...p.opciones, { id: Date.now(), nombre: '', precio: 0 }] } : p));
  };
  
  const removeOption = (pId, optionId) => {
    setPersonalizaciones(personalizaciones.map(p => p.id === pId ? { ...p, opciones: p.opciones.filter(opt => opt.id !== optionId) } : p));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !precio || !stock || !tags || !imageFile) {
      toast.error('Por favor, completa todos los campos básicos y sube una imagen');
      return;
    }

    const promise = new Promise(async (resolve, reject) => {
      try {
        const storageRef = ref(storage, `product-images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        const imageUrl = await getDownloadURL(storageRef);
        const tagsArray = tags.split(',').map(tag => tag.trim().toLowerCase());

        // --- MODIFICADO: Preparamos los datos para CADA tipo de personalización ---
        const finalPersonalizaciones = personalizaciones.map(({ id, tipo, label, opciones, opcionesFijas, maxLength }) => {
          if (tipo === 'material') {
            return { tipo, label, opciones: opciones.map(({ id, ...optRest }) => optRest).filter(opt => opt.nombre) };
          }
          if (tipo === 'texto') {
            return { tipo, label, maxLength: Number(maxLength) };
          }
          if (tipo === 'selector') {
            // Convertimos el string "A, B, C" en un array ["A", "B", "C"]
            const opcionesArray = opcionesFijas.split(',').map(opt => opt.trim()).filter(Boolean);
            return { tipo, label, opciones: opcionesArray };
          }
          if (tipo === 'colores') {
            return { tipo, label: label || 'Elige el color de hilo' };
          }
          if (tipo === 'muranos') {
            return { tipo, label: label || 'Elige el color de murano' };
          }
          return null;
        }).filter(Boolean);

        const newProductData = {
          nombre,
          nombre_lowercase: nombre.toLowerCase(),
          descripcion,
          precioBase: Number(precio),
          stock: Number(stock),
          tags: tagsArray,
          imagenUrl: imageUrl,
          personalizaciones: finalPersonalizaciones,
        };
        
        await addDoc(collection(db, 'productos'), newProductData);
        navigate('/admin');
        resolve("¡Producto añadido con éxito!");

      } catch (error) {
        console.error("Error al añadir producto:", error);
        reject("Hubo un error al añadir el producto.");
      }
    });

    toast.promise(promise, {
      loading: 'Añadiendo producto...',
      success: (msg) => msg,
      error: (err) => err,
    });
  };

  return (
    <div className="admin-container">
      <form className="product-form" onSubmit={handleSubmit}>
        <h3>Añadir Nuevo Producto</h3>
        <div className="form-group"><label>Nombre del Producto</label><input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required /></div>
        <div className="form-group"><label>Descripción</label><textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} /></div>
        <div className="form-group"><label>Precio Base (S/)</label><input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} required /></div>
        <div className="form-group"><label>Stock</label><input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required /></div>
        <div className="form-group"><label>Etiquetas</label><input type="text" placeholder="Ej: pulseras, hilo, para-parejas" value={tags} onChange={(e) => setTags(e.target.value)} required /></div>
        <div className="form-group"><label htmlFor="file-upload" className="file-input-label">{imageFile ? `Archivo: ${imageFile.name}` : "Seleccionar Archivo"}</label><input id="file-upload" type="file" accept="image/*" onChange={handleImageChange} required /></div>
        
        {/* --- GESTOR DE PERSONALIZACIONES MEJORADO --- */}
        <div className="customization-manager">
          <h4>Gestor de Personalizaciones</h4>
          {personalizaciones.map((p) => (
            <div key={p.id} className="customization-block">
              <button type="button" className="btn-remove-block" onClick={() => removePersonalizacion(p.id)}>×</button>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Personalización</label>
                  <select value={p.tipo} onChange={(e) => handlePersonalizacionChange(p.id, 'tipo', e.target.value)}>
                    <option value="" disabled>-- Elige un tipo --</option>
                    <option value="material">Material (con precio por opción)</option>
                    <option value="texto">Texto Personalizado</option>
                    <option value="selector">Selector Fijo (ej. Letras)</option>
                    <option value="colores">Selector de Colores de Hilo</option>
                    <option value="muranos">Selector de Colores de Murano</option>
                  </select>
                </div>
                {p.tipo && p.tipo !== 'colores' && (
                    <div className="form-group"><label>Etiqueta para el cliente</label><input type="text" placeholder="Ej: Elige la inicial" value={p.label} onChange={(e) => handlePersonalizacionChange(p.id, 'label', e.target.value)}/></div>
                )}
              </div>

              {/* --- RENDERIZADO CONDICIONAL PARA CADA TIPO --- */}
              {p.tipo === 'material' && (
                <>
                  <h5>Opciones de Material</h5>
                  {p.opciones.map((opt) => (
                    <div key={opt.id} className="option-row">
                      <input type="text" placeholder="Nombre (ej: Acero - Dorado)" value={opt.nombre} onChange={(e) => handleOptionChange(p.id, opt.id, 'nombre', e.target.value)} />
                      <input type="number" step="0.01" placeholder="Precio Final" value={opt.precio} onChange={(e) => handleOptionChange(p.id, opt.id, 'precio', e.target.value)} />
                      {p.opciones.length > 1 && <button type="button" className="btn-remove-option" onClick={() => removeOption(p.id, opt.id)}>−</button>}
                    </div>
                  ))}
                  <button type="button" className="btn-add-option" onClick={() => addOption(p.id)}>+ Añadir Opción</button>
                </>
              )}

              {p.tipo === 'texto' && (
                <div className="form-group">
                    <label>Máximo de caracteres:</label>
                    <input type="number" value={p.maxLength} onChange={(e) => handlePersonalizacionChange(p.id, 'maxLength', e.target.value)} min="1" />
                </div>
              )}

              {p.tipo === 'selector' && (
                <div className="form-group">
                    <label>Opciones (separadas por comas)</label>
                    <textarea 
                      placeholder="Ej: A, B, C, D, E..." 
                      value={p.opcionesFijas}
                      onChange={(e) => handlePersonalizacionChange(p.id, 'opcionesFijas', e.target.value)}
                    />
                </div>
              )}

              {p.tipo === 'colores' && (
                <p className="customization-notice">Se mostrará el selector de colores de hilo estándar.</p>
              )}

              {p.tipo === 'muranos' && (
                <div className="murano-selector-demo">
                  <p className="demo-info">Se mostrará el selector de muranos con diferentes tamaños para el cliente.</p>
                  <p className="demo-label"><strong>Incluye:</strong> Tamaños #3, #4, #6, #8 y selección de colores</p>
                  <div className="demo-preview">
                    <div className="demo-murano-sizes">
                      <div className="demo-size small" title="Tamaño #3">#3</div>
                      <div className="demo-size medium-small" title="Tamaño #4">#4</div>
                      <div className="demo-size medium" title="Tamaño #6">#6</div>
                      <div className="demo-size large" title="Tamaño #8">#8</div>
                    </div>
                    <div className="demo-murano-colors">
                      <div className="demo-color" style={{backgroundColor: '#DC143C'}}></div>
                      <div className="demo-color" style={{backgroundColor: '#000080'}}></div>
                      <div className="demo-color" style={{backgroundColor: '#50C878'}}></div>
                      <div className="demo-color" style={{backgroundColor: '#800080'}}></div>
                      <div className="demo-color" style={{backgroundColor: '#FFD700'}}></div>
                    </div>
                    <p className="demo-text">Vista previa: Selector completo de muranos por tamaños y colores</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button type="button" className="btn-add-block" onClick={addPersonalizacion}>
            + Añadir Nueva Personalización
          </button>
        </div>
        
        <div className="form-buttons">
          <button type="submit" className="submit-btn">Añadir Producto</button>
          <button type="button" className="btn-cancel" onClick={() => navigate('/admin')}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;