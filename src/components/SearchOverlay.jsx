// src/components/SearchOverlay.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import './SearchOverlay.css';

const SearchOverlay = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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
    navigate(`/search?q=${searchQuery}`);
    onClose(); // Cierra el overlay después de buscar
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
      </div>
    </div>
  );
};

export default SearchOverlay;