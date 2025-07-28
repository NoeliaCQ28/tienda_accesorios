// src/components/SearchOverlay.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useSearch } from '../context/SearchContext';
import './SearchOverlay.css';

const SearchOverlay = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { setSearchTerm, updateFilters } = useSearch();

  // Enfoca el input automáticamente cuando el componente aparece
  useEffect(() => {
    const input = document.getElementById('search-overlay-input');
    if (input) {
      input.focus();
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() === '') return;
    setSearchTerm(searchQuery);
    navigate(`/search?q=${searchQuery}`);
    onClose(); // Cierra el overlay después de buscar
  };

  const handleQuickFilter = (filterType, value) => {
    // Aplicar filtro rápido y navegar a la página de búsqueda
    if (filterType === 'category') {
      updateFilters({ categories: [value] });
      navigate(`/search?category=${value}`);
    } else if (filterType === 'price') {
      if (value === 'low') {
        updateFilters({ sortBy: 'price-asc' });
      } else if (value === 'high') {
        updateFilters({ sortBy: 'price-desc' });
      }
      navigate('/search');
    }
    onClose();
  };

  return (
    <div className="search-overlay-backdrop" onClick={onClose}>
      <div className="search-overlay-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        <form onSubmit={handleSearchSubmit} className="search-overlay-form">
          <input
            id="search-overlay-input"
            type="search"
            placeholder="¿Qué estás buscando hoy?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-overlay-input"
          />
          <button type="submit" className="search-overlay-button">
            <FaSearch />
          </button>
        </form>

        {/* Filtros rápidos */}
        <div className="quick-filters">
          <h3>Filtros rápidos</h3>
          <div className="quick-filter-categories">
            <h4>Categorías populares</h4>
            <div className="quick-filter-buttons">
              <button onClick={() => handleQuickFilter('category', 'pulseras')}>
                Pulseras
              </button>
              <button onClick={() => handleQuickFilter('category', 'collares')}>
                Collares
              </button>
              <button onClick={() => handleQuickFilter('category', 'aretes')}>
                Aretes
              </button>
              <button onClick={() => handleQuickFilter('category', 'anillos')}>
                Anillos
              </button>
              <button onClick={() => handleQuickFilter('category', 'llaveros')}>
                Llaveros
              </button>
            </div>
          </div>
          <div className="quick-filter-price">
            <h4>Precio</h4>
            <div className="quick-filter-buttons">
              <button onClick={() => handleQuickFilter('price', 'low')}>
                Menor precio
              </button>
              <button onClick={() => handleQuickFilter('price', 'high')}>
                Mayor precio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;