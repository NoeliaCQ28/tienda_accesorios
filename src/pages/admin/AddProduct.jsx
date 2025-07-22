import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import '../Admin.css';

const AddProduct = () => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [tags, setTags] = useState('');
  const navigate = useNavigate();

  const [customizable, setCustomizable] = useState(false);
  const [customizationMaxLength, setCustomizationMaxLength] = useState(5);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !precio || !stock || !tags || !imageFile) {
      toast.error('Por favor, completa todos los campos y sube una imagen');
      return;
    }

    let finalMaxLength = 0;
    if (customizable) {
      if (!customizationMaxLength || customizationMaxLength < 1) {
        toast.error("Si el producto es personalizable, el máximo de caracteres debe ser al menos 1.");
        return;
      }
      finalMaxLength = parseInt(customizationMaxLength, 10);
    }

    const promise = new Promise(async (resolve, reject) => {
      try {
        const storageRef = ref(storage, `product-images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        const imageUrl = await getDownloadURL(storageRef);

        const initialTags = tags.split(',').map(tag => tag.trim().toLowerCase());
        const expandedTags = new Set(initialTags); 

        initialTags.forEach(tag => {
          const subTags = tag.split(/[\s-]+/);
          if (subTags.length > 1) {
            subTags.forEach(subTag => expandedTags.add(subTag));
          }
        });
        
        const newProductData = {
          nombre: nombre,
          nombre_lowercase: nombre.toLowerCase(),
          descripcion: descripcion,
          precio: Number(precio),
          stock: Number(stock),
          tags: Array.from(expandedTags),
          imagenUrl: imageUrl,
          customizable: customizable,
          customizationMaxLength: finalMaxLength,
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
        <div className="form-group"><label>Precio (S/)</label><input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} required /></div>
        <div className="form-group"><label>Stock</label><input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required /></div>
        <div className="form-group">
          <label>Etiquetas (separadas por comas)</label>
          <input type="text" placeholder="Ej: pulseras, murano, para-parejas" value={tags} onChange={(e) => setTags(e.target.value)} required />
        </div>
        
        {/* --- INICIO DE LA MODIFICACIÓN: SECCIÓN DE PERSONALIZACIÓN MEJORADA --- */}
        <div className="customization-section">
          <h4 className="customization-section-title">Opciones de Personalización de Texto</h4>
          <div className="customization-checkbox-group">
            <input
              type="checkbox"
              id="customizable-checkbox"
              checked={customizable}
              onChange={(e) => setCustomizable(e.target.checked)}
            />
            <label htmlFor="customizable-checkbox">Permitir texto personalizado en este producto</label>
          </div>

          {customizable && (
            <div className="customization-max-length-group">
              <label htmlFor="maxLength">Máximo de caracteres:</label>
              <input
                id="maxLength"
                type="number"
                value={customizationMaxLength}
                onChange={(e) => setCustomizationMaxLength(e.target.value)}
                min="1"
              />
            </div>
          )}
        </div>
        {/* --- FIN DE LA MODIFICACIÓN --- */}

        <div className="form-group">
          <label htmlFor="file-upload" className="file-input-label">{imageFile ? `Archivo: ${imageFile.name}` : "Seleccionar Archivo"}</label>
          <input id="file-upload" type="file" accept="image/*" onChange={handleImageChange} required />
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