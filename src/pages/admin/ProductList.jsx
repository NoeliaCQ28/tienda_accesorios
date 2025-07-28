// src/pages/admin/ProductList.jsx - VERSIÓN FINAL CON ELIMINACIÓN CORREGIDA

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, storage } from '../../firebaseConfig';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import '../Admin.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "productos"));
    const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setProducts(newData);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Esta es la función que espera el objeto completo del producto
  const handleDelete = async (productToDelete) => {
    const confirmDelete = window.confirm(`¿Estás segura de que quieres eliminar "${productToDelete.nombre}"?`);
    
    if (confirmDelete) {
      try {
        // Borra la imagen de Storage usando la imagenUrl del producto
        if (productToDelete.imagenUrl) {
          const imageRef = ref(storage, productToDelete.imagenUrl);
          await deleteObject(imageRef);
        }

        // Borra el documento de Firestore usando el id del producto
        await deleteDoc(doc(db, "productos", productToDelete.id));

        alert("Producto y su imagen eliminados con éxito");
        fetchProducts(); // Actualizamos la lista
      } catch (error) {
        console.error("Error al eliminar el producto o su imagen: ", error);
        alert("Hubo un error al eliminar. Revisa la consola.");
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    const tagsMatch = selectedCategory === 'todos' || (product.tags && product.tags.includes(selectedCategory));
    const searchMatch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    return tagsMatch && searchMatch;
  });

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Panel de Administración</h2>
        <Link to="/admin/add" className="btn-add-new">Añadir Nuevo Producto</Link>
      </div>

      <div className="product-list-container">
        <div className="list-controls">
          <h3>Productos Actuales ({filteredProducts.length})</h3>
          <div className="filters">
            <select className="category-filter" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="todos">Todas las etiquetas</option>
              <option value="pulseras">Pulseras</option>
              <option value="collares">Collares</option>
              <option value="resina">Resina</option>
              <option value="recuerdos">Recuerdos</option>
              <option value="llaveros">Llaveros</option>
              <option value="para-parejas">Para Parejas</option>
            </select>
            <input type="text" placeholder="Buscar por nombre..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="table-container">
          <table className="product-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Etiquetas</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td><img src={product.imagenUrl} alt={product.nombre} className="table-item-image" /></td>
                  <td>{product.nombre}</td>
                  <td>{product.tags ? product.tags.join(', ') : ''}</td>
                  <td>S/ {product.precioBase ? product.precioBase.toFixed(2) : '0.00'}</td>
                  <td>{product.stock}</td>
                  <td>
                    <div className="table-item-actions">
                      <Link to={`/admin/edit/${product.id}`} className="btn-edit">Editar</Link>
                      {/* Este botón ahora pasa el objeto 'product' completo */}
                      <button onClick={() => handleDelete(product)} className="btn-delete">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
