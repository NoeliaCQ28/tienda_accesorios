// src/pages/admin/ComponentManager.jsx

import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { loadSampleData } from '../../data/sampleComponents';
import ComponentForm from './components/ComponentForm';
import ComponentTable from './components/ComponentTable';
import ComponentGrid from './components/ComponentGrid';
import ComponentStats from './components/ComponentStats';
import './ComponentManager.css';

const ComponentManager = () => {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table', 'grid', 'cards'
  const [showForm, setShowForm] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Cargar componentes desde Firebase
  const loadComponents = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'components'));
      const componentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComponents(componentsData);
    } catch (error) {
      console.error('Error al cargar componentes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Guardar componente (crear o editar)
  const saveComponent = async (componentData) => {
    try {
      if (editingComponent) {
        // Editar componente existente
        const componentRef = doc(db, 'components', editingComponent.id);
        await updateDoc(componentRef, {
          ...componentData,
          updatedAt: new Date(),
          updatedBy: 'admin' // Aquí puedes usar el usuario actual
        });
      } else {
        // Crear nuevo componente
        await addDoc(collection(db, 'components'), {
          ...componentData,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'admin', // Aquí puedes usar el usuario actual
          usageCount: 0
        });
      }
      loadComponents();
      setShowForm(false);
      setEditingComponent(null);
    } catch (error) {
      console.error('Error al guardar componente:', error);
    }
  };

  // Eliminar componente
  const deleteComponent = async (componentId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este componente?')) {
      try {
        await deleteDoc(doc(db, 'components', componentId));
        loadComponents();
      } catch (error) {
        console.error('Error al eliminar componente:', error);
      }
    }
  };

  // Filtrar y ordenar componentes
  const filteredComponents = components
    .filter(component => {
      const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          component.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'todos' || component.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Obtener tipos únicos para el filtro
  const uniqueTypes = [...new Set(components.map(c => c.type))];

  useEffect(() => {
    loadComponents();
  }, []);

  const handleEdit = (component) => {
    setEditingComponent(component);
    setShowForm(true);
  };

  const handleNewComponent = () => {
    setEditingComponent(null);
    setShowForm(true);
  };

  const handleLoadSampleData = async () => {
    if (window.confirm('¿Cargar datos de ejemplo? Esto agregará 5 componentes de muestra.')) {
      try {
        await loadSampleData(db);
        loadComponents();
        alert('Datos de ejemplo cargados exitosamente');
      } catch (error) {
        alert('Error al cargar datos de ejemplo');
        console.error(error);
      }
    }
  };

  if (loading) {
    return (
      <div className="component-manager">
        <div className="loading">Cargando componentes...</div>
      </div>
    );
  }

  return (
    <div className="component-manager">
      {/* Header con estadísticas */}
      <div className="component-header">
        <div className="header-content">
          <h3>Gestor de Componentes</h3>
          <ComponentStats components={components} />
        </div>
      </div>

      {/* Barra de acciones */}
      <div className="component-actions">
        <div className="actions-left">
          <button 
            className="btn-primary"
            onClick={handleNewComponent}
          >
            + Nuevo Componente
          </button>
          
          {components.length === 0 && (
            <button 
              className="btn-secondary"
              onClick={handleLoadSampleData}
            >
              📦 Cargar Datos de Ejemplo
            </button>
          )}
          
          <div className="view-modes">
            <button 
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Vista de tabla"
            >
              📋
            </button>
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Vista en cuadrícula"
            >
              ⚏
            </button>
            <button 
              className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Vista de tarjetas"
            >
              📄
            </button>
          </div>
        </div>

        <div className="actions-right">
          <div className="search-filters">
            <input
              type="text"
              placeholder="Buscar componentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todos los tipos</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="sort-select"
            >
              <option value="name-asc">Nombre A-Z</option>
              <option value="name-desc">Nombre Z-A</option>
              <option value="type-asc">Tipo A-Z</option>
              <option value="createdAt-desc">Más recientes</option>
              <option value="usageCount-desc">Más usados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Formulario (Modal) */}
      {showForm && (
        <ComponentForm
          component={editingComponent}
          onSave={saveComponent}
          onCancel={() => {
            setShowForm(false);
            setEditingComponent(null);
          }}
        />
      )}

      {/* Vista de componentes */}
      <div className="component-content">
        {filteredComponents.length === 0 ? (
          <div className="empty-state">
            <h4>No se encontraron componentes</h4>
            <p>
              {components.length === 0 
                ? 'Comienza creando tu primer componente' 
                : 'Intenta cambiar los filtros de búsqueda'
              }
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'table' && (
              <ComponentTable
                components={filteredComponents}
                onEdit={handleEdit}
                onDelete={deleteComponent}
              />
            )}
            {viewMode === 'grid' && (
              <ComponentGrid
                components={filteredComponents}
                onEdit={handleEdit}
                onDelete={deleteComponent}
              />
            )}
            {viewMode === 'cards' && (
              <ComponentGrid
                components={filteredComponents}
                onEdit={handleEdit}
                onDelete={deleteComponent}
                variant="cards"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ComponentManager;
