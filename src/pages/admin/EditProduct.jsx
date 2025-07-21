import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, storage } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import '../Admin.css';

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [tags, setTags] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProduct = async () => {
      const productDocRef = doc(db, 'productos', productId);
      const docSnap = await getDoc(productDocRef);

      if (docSnap.exists()) {
        const productData = docSnap.data();
        setNombre(productData.nombre);
        setDescripcion(productData.descripcion || '');
        setPrecio(productData.precio.toString());
        setStock(productData.stock.toString());
        setTags(productData.tags ? productData.tags.join(', ') : '');
        setExistingImageUrl(productData.imagenUrl);
      } else {
        toast.error("No se encontró el producto para editar!");
        navigate('/admin');
      }
      setLoading(false);
    };

    getProduct();
  }, [productId, navigate]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const promise = new Promise(async (resolve, reject) => {
        try {
            let imageUrl = existingImageUrl;

            if (imageFile) {
                const storageRef = ref(storage, `product-images/${Date.now()}_${imageFile.name}`);
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            // Lógica mejorada para procesar las etiquetas
            const initialTags = tags.split(',').map(tag => tag.trim().toLowerCase());
            const expandedTags = new Set(initialTags);

            initialTags.forEach(tag => {
                const subTags = tag.split(/[\s-]+/);
                if (subTags.length > 1) {
                subTags.forEach(subTag => expandedTags.add(subTag));
                }
            });

            const productDocRef = doc(db, 'productos', productId);
            
            const updatedData = {
                nombre: nombre,
                nombre_lowercase: nombre.toLowerCase(),
                descripcion: descripcion,
                precio: Number(precio),
                stock: Number(stock),
                tags: Array.from(expandedTags),
                imagenUrl: imageUrl,
            };

            await updateDoc(productDocRef, updatedData);
            
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

  if (loading) {
    return <h1>Cargando producto...</h1>;
  }

  return (
    <div className="admin-container">
      <form className="product-form" onSubmit={handleSubmit}>
        <h3>Editar Producto</h3>
        <div className="form-group"><label>Nombre</label><input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required /></div>
        <div className="form-group"><label>Descripción</label><textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} /></div>
        <div className="form-group"><label>Precio (S/)</label><input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} required /></div>
        <div className="form-group"><label>Stock</label><input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required /></div>
        <div className="form-group">
          <label>Etiquetas (separadas por comas)</label>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Imagen Actual</label>
          {existingImageUrl && <img src={existingImageUrl} alt="Imagen actual" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}/>}
        </div>
        <div className="form-group">
          <label htmlFor="file-upload" className="file-input-label">{imageFile ? `Nuevo archivo: ${imageFile.name}` : "Cambiar Imagen (opcional)"}</label>
          <input id="file-upload" type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <div className="form-buttons">
          <button type="submit" className="submit-btn">Guardar Cambios</button>
          <button type="button" className="btn-cancel" onClick={() => navigate('/admin')}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;