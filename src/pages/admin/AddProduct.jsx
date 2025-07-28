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
        tipo: '', // Forzar al usuario a elegir un tipo
        label: '',
        opciones: [{ id: Date.now(), nombre: '', precio: 0 }],
        maxLength: 10,
      },
    ]);
  };

  const removePersonalizacion = (id) => {
    setPersonalizaciones(personalizaciones.filter((p) => p.id !== id));
  };

  const handlePersonalizacionChange = (id, field, value) => {
    const newPersonalizaciones = personalizaciones.map((p) => {
      if (p.id === id) {
        if (field === 'tipo' && value === 'colores') {
          // Si eligen 'colores', pre-llenamos la etiqueta.
          return { ...p, [field]: value, label: 'Elige una familia de colores' };
        }
        if (field === 'maxLength') {
          return { ...p, [field]: parseInt(value, 10) || 0 };
        }
        return { ...p, [field]: value };
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

        // --- MODIFICADO: Limpieza de datos antes de guardar ---
        const finalPersonalizaciones = personalizaciones.map(({ id, tipo, label, opciones, maxLength }) => {
          if (tipo === 'material') {
            return { tipo, label, opciones: opciones.map(({ id, ...optRest }) => optRest).filter(opt => opt.nombre) };
          }
          if (tipo === 'texto') {
            return { tipo, label, maxLength };
          }
          if (tipo === 'colores') {
            return { tipo, label: label || "Elige una familia de colores" }; // Se guarda solo el tipo y la etiqueta
          }
          return null;
        }).filter(Boolean);

        const newProductData = {
          nombre: nombre,
          nombre_lowercase: nombre.toLowerCase(),
          descripcion: descripcion,
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

        <div className="customization-manager">
          <h4>Gestor de Personalizaciones</h4>
          {personalizaciones.map((p) => (
            <div key={p.id} className="customization-block">
              <button type="button" className="btn-remove-block" onClick={() => removePersonalizacion(p.id)}>×</button>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Personalización</label>
                  <select
                    value={p.tipo}
                    onChange={(e) => handlePersonalizacionChange(p.id, 'tipo', e.target.value)}
                  >
                    <option value="" disabled>-- Elige un tipo --</option>
                    <option value="material">Material (con precio por opción)</option>
                    <option value="texto">Texto Personalizado</option>
                    {/* --- NUEVO: Opción de Colores --- */}
                    <option value="colores">Selector de Colores de Hilo</option>
                  </select>
                </div>
                
                {/* La etiqueta se muestra para todos menos para 'colores' que es fija */}
                {p.tipo !== 'colores' && (
                    <div className="form-group">
                        <label>Etiqueta para el cliente</label>
                        <input
                            type="text"
                            placeholder="Ej: Elige el material del dije"
                            value={p.label}
                            onChange={(e) => handlePersonalizacionChange(p.id, 'label', e.target.value)}
                        />
                    </div>
                )}
              </div>

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