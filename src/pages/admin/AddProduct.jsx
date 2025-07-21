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

    const promise = new Promise(async (resolve, reject) => {
      try {
        const storageRef = ref(storage, `product-images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        const imageUrl = await getDownloadURL(storageRef);

        // Lógica mejorada para procesar las etiquetas
        const initialTags = tags.split(',').map(tag => tag.trim().toLowerCase());
        const expandedTags = new Set(initialTags); 

        initialTags.forEach(tag => {
          const subTags = tag.split(/[\s-]+/);
          if (subTags.length > 1) {
            subTags.forEach(subTag => expandedTags.add(subTag));
          }
        });
        
        await addDoc(collection(db, 'productos'), {
          nombre: nombre,
          nombre_lowercase: nombre.toLowerCase(),
          descripcion: descripcion,
          precio: Number(precio),
          stock: Number(stock),
          tags: Array.from(expandedTags),
          imagenUrl: imageUrl,
        });

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