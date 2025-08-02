// src/pages/admin/EditProduct.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, storage } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import toast from 'react-hot-toast';
import ComponentSelector from '../../components/ComponentSelector';
import { useComponentUsage } from '../../hooks/useComponentUsage';
import '../Admin.css';
import './Customizations.css'; // Reutilizamos los mismos estilos

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { incrementComponentUsage, decrementComponentUsage } = useComponentUsage();

  // Estados para los campos básicos
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precioBase, setPrecioBase] = useState('');
  const [stock, setStock] = useState('');
  const [tags, setTags] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [loading, setLoading] = useState(true);

  // --- NUEVO: Estado para gestionar las personalizaciones ---
  const [personalizaciones, setPersonalizaciones] = useState([]);
  const [originalComponentIds, setOriginalComponentIds] = useState([]);

  // --- MODIFICADO: useEffect para cargar TODOS los datos del producto, incluyendo personalizaciones ---
  useEffect(() => {
    const getProduct = async () => {
      const productDocRef = doc(db, 'productos', productId);
      const docSnap = await getDoc(productDocRef);

      if (docSnap.exists()) {
        const productData = docSnap.data();
        setNombre(productData.nombre);
        setDescripcion(productData.descripcion || '');
        setPrecioBase(productData.precioBase ? productData.precioBase.toString() : '0');
        setStock(productData.stock.toString());
        setTags(productData.tags ? productData.tags.join(', ') : '');
        setExistingImageUrl(productData.imagenUrl);

        // --- NUEVO: Cargar las personalizaciones existentes ---
        // Les añadimos IDs temporales para que React pueda manejarlas en el formulario
        if (productData.personalizaciones) {
          const loadedPersonalizaciones = productData.personalizaciones.map(p => ({
            ...p,
            id: Date.now() + Math.random(), // ID temporal único para el bloque
            // Para 'material', también añadimos IDs a las opciones
            opciones: p.opciones && Array.isArray(p.opciones) 
              ? p.opciones.map(opt => ({ 
                  ...opt, 
                  id: Date.now() + Math.random() // ID temporal único para la opción
                })) 
              : [],
            // Para 'selector', unimos el array de nuevo en un string para el textarea
            opcionesFijas: (p.tipo === 'selector' && Array.isArray(p.opciones)) ? p.opciones.join(', ') : '',
            // Asegurar que los campos de componentes existan
            selectedComponents: p.selectedComponents || [],
            componentPrices: p.componentPrices || {},
            allowMultiple: p.allowMultiple || false,
            filterByType: p.filterByType || ''
          }));
          setPersonalizaciones(loadedPersonalizaciones);

          // Extraer IDs de componentes originales para el tracking de uso
          const originalComponents = loadedPersonalizaciones
            .filter(p => p.tipo === 'componentes')
            .flatMap(p => p.selectedComponents || []);
          setOriginalComponentIds(originalComponents);
        }

      } else {
        toast.error("No se encontró el producto para editar!");
        navigate('/admin');
      }
      setLoading(false);
    };

    getProduct();
  }, [productId, navigate]);
  
  // --- NUEVO: Todas las funciones para manejar el estado de las personalizaciones (idénticas a AddProduct.jsx) ---
  const addPersonalizacion = () => {
    setPersonalizaciones([ 
      ...personalizaciones, 
      { 
        id: Date.now(), 
        tipo: '', 
        label: '', 
        opciones: [{ id: Date.now(), nombre: '', precio: 0 }], 
        opcionesFijas: '', 
        maxLength: 20,
        selectedComponents: [],
        componentPrices: {},
        allowMultiple: false,
        filterByType: ''
      } 
    ]);
  };

  const removePersonalizacion = (id) => {
    setPersonalizaciones(personalizaciones.filter((p) => p.id !== id));
  };

  const handlePersonalizacionChange = (id, field, value) => {
    setPersonalizaciones(personalizaciones.map(p => {
        if (p.id === id) {
            let updatedP = { ...p, [field]: value };
            if (field === 'tipo') {
              updatedP.opciones = [{ id: Date.now(), nombre: '', precio: 0 }];
              updatedP.opcionesFijas = '';
              updatedP.maxLength = 20;
              updatedP.selectedComponents = [];
              updatedP.componentPrices = {};
              updatedP.allowMultiple = false;
              updatedP.filterByType = '';
              if (value === 'colores') updatedP.label = 'Elige una familia de colores';
            }
            return updatedP;
        }
        return p;
    }));
  };

  const handleOptionChange = (pId, optionId, field, value) => {
    setPersonalizaciones(personalizaciones.map(p => {
      if (p.id === pId) {
        return { ...p, opciones: p.opciones.map(opt => {
          if (opt.id === optionId) {
            const finalValue = field === 'precio' ? parseFloat(value) || 0 : value;
            return { ...opt, [field]: finalValue };
          }
          return opt;
        })};
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

  // Nuevas funciones para manejar el ComponentSelector
  const handleComponentToggle = (pId, selectedComponents) => {
    setPersonalizaciones(personalizaciones.map(p => 
      p.id === pId ? { ...p, selectedComponents } : p
    ));
  };

  const handleComponentPriceChange = (pId, componentId, price) => {
    setPersonalizaciones(personalizaciones.map(p => {
      if (p.id === pId) {
        return {
          ...p,
          componentPrices: {
            ...p.componentPrices,
            [componentId]: price
          }
        };
      }
      return p;
    }));
  };

  const handleComponentConfigChange = (pId, field, value) => {
    setPersonalizaciones(personalizaciones.map(p => 
      p.id === pId ? { ...p, [field]: value } : p
    ));
  };
  
  const handleImageChange = (e) => {
    if (e.target.files[0]) setImageFile(e.target.files[0]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const promise = new Promise(async (resolve, reject) => {
        try {
            let imageUrl = existingImageUrl;
            if (imageFile) {
                if (existingImageUrl) {
                    try { await deleteObject(ref(storage, existingImageUrl)); } catch (error) { console.warn("La imagen anterior no se pudo borrar:", error); }
                }
                const storageRef = ref(storage, `product-images/${Date.now()}_${imageFile.name}`);
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            const tagsArray = tags.split(',').map(tag => tag.trim().toLowerCase());

            // Preparamos las personalizaciones para guardarlas, limpiando datos e IDs temporales
            const finalPersonalizaciones = personalizaciones.map(({ id, tipo, label, opciones, opcionesFijas, maxLength, selectedComponents, componentPrices, allowMultiple, filterByType }) => {
                if (tipo === 'material') {
                    return { tipo, label, opciones: opciones.map(({ id, ...optRest }) => optRest).filter(opt => opt.nombre) };
                }
                if (tipo === 'componentes') {
                    return { 
                      tipo, 
                      label, 
                      selectedComponents: selectedComponents || [],
                      componentPrices: componentPrices || {},
                      allowMultiple: allowMultiple || false,
                      filterByType: filterByType || ''
                    };
                }
                if (tipo === 'texto') {
                    return { tipo, label, maxLength: Number(maxLength) };
                }
                if (tipo === 'selector') {
                    const opcionesArray = opcionesFijas.split(',').map(opt => opt.trim()).filter(Boolean);
                    return { tipo, label, opciones: opcionesArray };
                }
                if (tipo === 'colores') {
                    return { tipo, label: label || "Elige una familia de colores" };
                }
                if (tipo === 'muranos') {
                    return { tipo, label: label || "Elige el color de murano" };
                }
                return null;
            }).filter(Boolean);

            const updatedData = {
                nombre,
                nombre_lowercase: nombre.toLowerCase(),
                descripcion,
                precioBase: Number(precioBase),
                stock: Number(stock),
                tags: tagsArray,
                imagenUrl: imageUrl,
                personalizaciones: finalPersonalizaciones,
            };

            // Actualizar uso de componentes
            const componentesPersonalizacion = personalizaciones.find(p => p.tipo === 'componentes');
            if (componentesPersonalizacion?.selectedComponents) {
                // Obtener componentes seleccionados previamente
                const originalProduct = await getDoc(doc(db, 'productos', productId));
                const originalData = originalProduct.data();
                const originalComponentes = originalData?.personalizaciones
                    ?.find(p => p.tipo === 'componentes')
                    ?.selectedComponents || [];

                // Decrementar uso de componentes que ya no están seleccionados
                for (const originalCompId of originalComponentes) {
                    const stillSelected = componentesPersonalizacion.selectedComponents.includes(originalCompId);
                    if (!stillSelected) {
                        await decrementComponentUsage(originalCompId);
                    }
                }

                // Incrementar uso de componentes nuevos
                for (const newCompId of componentesPersonalizacion.selectedComponents) {
                    const wasSelected = originalComponentes.includes(newCompId);
                    if (!wasSelected) {
                        await incrementComponentUsage(newCompId);
                    }
                }
            }

            await updateDoc(doc(db, 'productos', productId), updatedData);
            navigate('/admin');
            resolve("¡Producto actualizado con éxito!");
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            reject("Hubo un error al actualizar el producto.");
        }
    });

    toast.promise(promise, {
        loading: 'Actualizando producto...',
        success: (msg) => msg,
        error: (err) => err,
      });
  };

  if (loading) return <h1>Cargando producto...</h1>;

  return (
    <div className="admin-container">
      <form className="product-form" onSubmit={handleSubmit}>
        <h3>Editar Producto</h3>
        
        <div className="form-group"><label>Nombre</label><input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required /></div>
        <div className="form-group"><label>Descripción</label><textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} /></div>
        <div className="form-group"><label>Precio Base (S/)</label><input type="number" value={precioBase} onChange={(e) => setPrecioBase(e.target.value)} required /></div>
        <div className="form-group"><label>Stock</label><input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required /></div>
        <div className="form-group"><label>Etiquetas</label><input type="text" value={tags} onChange={(e) => setTags(e.target.value)} required /></div>
        <div className="form-group"><label>Imagen Actual</label>{existingImageUrl && <img src={existingImageUrl} alt="Imagen actual" className="image-preview"/>}</div>
        <div className="form-group"><label htmlFor="file-upload" className="file-input-label">{imageFile ? `Nuevo: ${imageFile.name}` : "Cambiar Imagen"}</label><input id="file-upload" type="file" accept="image/*" onChange={handleImageChange} /></div>

        {/* --- GESTOR DE PERSONALIZACIONES --- */}
        <div className="customization-manager">
          <h4>Gestor de Personalizaciones</h4>
          {personalizaciones.map((p) => (
            <div key={p.id} className="customization-block">
              <button type="button" className="btn-remove-block" onClick={() => removePersonalizacion(p.id)}>×</button>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo</label>
                  <select value={p.tipo} onChange={(e) => handlePersonalizacionChange(p.id, 'tipo', e.target.value)}>
                    <option value="" disabled>-- Elige un tipo --</option>
                    <option value="material">Material (con precio por opción)</option>
                    <option value="componentes">Selector de Componentes</option>
                    <option value="texto">Texto Personalizado</option>
                    <option value="selector">Selector Fijo (ej. Letras)</option>
                    <option value="colores">Selector de Colores de Hilo</option>
                    <option value="muranos">Selector de Colores de Murano</option>
                  </select>
                </div>
                {p.tipo && p.tipo !== 'colores' && (
                    <div className="form-group"><label>Etiqueta</label><input type="text" placeholder="Ej: Elige la inicial" value={p.label} onChange={(e) => handlePersonalizacionChange(p.id, 'label', e.target.value)}/></div>
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

              {p.tipo === 'componentes' && (
                <ComponentSelector
                  selectedComponents={p.selectedComponents || []}
                  componentPrices={p.componentPrices || {}}
                  allowMultiple={p.allowMultiple || false}
                  filterByType={p.filterByType || ''}
                  onComponentToggle={(selectedComponents) => handleComponentToggle(p.id, selectedComponents)}
                  onPriceChange={(componentId, price) => handleComponentPriceChange(p.id, componentId, price)}
                  onConfigChange={(field, value) => handleComponentConfigChange(p.id, field, value)}
                />
              )}

              {p.tipo === 'texto' && (
                <div className="form-group"><label>Máximo de caracteres:</label><input type="number" value={p.maxLength} onChange={(e) => handlePersonalizacionChange(p.id, 'maxLength', e.target.value)} min="1" /></div>
              )}

              {p.tipo === 'selector' && (
                <div className="form-group"><label>Opciones (separadas por comas)</label><textarea placeholder="Ej: A, B, C, D, E..." value={p.opcionesFijas} onChange={(e) => handlePersonalizacionChange(p.id, 'opcionesFijas', e.target.value)} /></div>
              )}

              {p.tipo === 'colores' && (
                <p className="customization-notice">Se mostrará el selector de colores de hilo estándar.</p>
              )}

              {p.tipo === 'muranos' && (
                <p className="customization-notice">Se mostrará el selector de colores de murano estándar.</p>
              )}
            </div>
          ))}
          <button type="button" className="btn-add-block" onClick={addPersonalizacion}>+ Añadir Personalización</button>
        </div>
        {/* --- FIN DEL GESTOR --- */}

        <div className="form-buttons">
          <button type="submit" className="submit-btn">Guardar Cambios</button>
          <button type="button" className="btn-cancel" onClick={() => navigate('/admin')}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
