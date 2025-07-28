// src/components/SearchFilters.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useSearch } from '../context/SearchContext';
import { FaFilter, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './SearchFilters.css';

const SearchFilters = () => {
  const { filters, updateFilters, resetFilters } = useSearch();
  const [isOpen, setIsOpen] = useState(false);
  const filterRef = useRef(null);
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    sort: true,
    categories: false,
    colors: false,
    customizable: false
  });

  const availableCategories = [
    'pulseras',
    'collares',
    'aretes',
    'anillos',
    'llaveros',
    'accesorios',
    'destacado'
  ];

  const availableColors = [
    'azul', 'celeste', 'verde', 'amarillo', 'dorado',
    'rosa', 'fucsia', 'rojo', 'coral', 'naranja',
    'morado', 'lila', 'negro', 'gris', 'blanco', 'beige'
  ];

  const sortOptions = [
    { value: '', label: 'Relevancia' },
    { value: 'price-asc', label: 'Precio: Menor a Mayor' },
    { value: 'price-desc', label: 'Precio: Mayor a Menor' },
    { value: 'name-asc', label: 'Nombre: A-Z' },
    { value: 'name-desc', label: 'Nombre: Z-A' }
  ];

  // Cerrar panel al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePriceChange = (field, value) => {
    updateFilters({
      priceRange: {
        ...filters.priceRange,
        [field]: value
      }
    });
  };

  const handleSortChange = (value) => {
    updateFilters({ sortBy: value });
  };

  const handleCategoryToggle = (category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    updateFilters({ categories: newCategories });
  };

  const handleColorToggle = (color) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    
    updateFilters({ colors: newColors });
  };

  const handleCustomizableChange = (value) => {
    updateFilters({ customizable: value });
  };

  const hasActiveFilters = () => {
    return filters.priceRange.min !== '' || 
           filters.priceRange.max !== '' ||
           filters.sortBy !== '' ||
           filters.categories.length > 0 ||
           filters.colors.length > 0 ||
           filters.customizable !== null;
  };

  return (
    <div className="search-filters" ref={filterRef}>
      <button 
        className={`filters-toggle ${hasActiveFilters() ? 'has-filters' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaFilter />
        Filtros
        {hasActiveFilters() && <span className="filter-count">●</span>}
      </button>

      {isOpen && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3>Filtros</h3>
            <div className="filters-actions">
              <button onClick={resetFilters} className="clear-filters">
                Limpiar
              </button>
              <button onClick={() => setIsOpen(false)} className="close-filters">
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="filters-content">
            {/* Filtro de Precio */}
            <div className="filter-section">
              <button 
                className="filter-section-header"
                onClick={() => toggleSection('price')}
              >
                <span>Precio</span>
                {expandedSections.price ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {expandedSections.price && (
                <div className="filter-section-content">
                  <div className="price-range">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={filters.priceRange.min}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                      className="price-input"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Máx"
                      value={filters.priceRange.max}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                      className="price-input"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Filtro de Ordenamiento */}
            <div className="filter-section">
              <button 
                className="filter-section-header"
                onClick={() => toggleSection('sort')}
              >
                <span>Ordenar por</span>
                {expandedSections.sort ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {expandedSections.sort && (
                <div className="filter-section-content">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="sort-select"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Filtro de Categorías */}
            <div className="filter-section">
              <button 
                className="filter-section-header"
                onClick={() => toggleSection('categories')}
              >
                <span>Categorías</span>
                {filters.categories.length > 0 && (
                  <span className="filter-badge">{filters.categories.length}</span>
                )}
                {expandedSections.categories ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {expandedSections.categories && (
                <div className="filter-section-content">
                  <div className="checkbox-list">
                    {availableCategories.map(category => (
                      <label key={category} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category)}
                          onChange={() => handleCategoryToggle(category)}
                        />
                        <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro de Colores */}
            <div className="filter-section">
              <button 
                className="filter-section-header"
                onClick={() => toggleSection('colors')}
              >
                <span>Colores</span>
                {filters.colors.length > 0 && (
                  <span className="filter-badge">{filters.colors.length}</span>
                )}
                {expandedSections.colors ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {expandedSections.colors && (
                <div className="filter-section-content">
                  <div className="checkbox-list">
                    {availableColors.map(color => (
                      <label key={color} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={filters.colors.includes(color)}
                          onChange={() => handleColorToggle(color)}
                        />
                        <span>{color.charAt(0).toUpperCase() + color.slice(1).replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro de Personalizable */}
            <div className="filter-section">
              <button 
                className="filter-section-header"
                onClick={() => toggleSection('customizable')}
              >
                <span>Personalizable</span>
                {expandedSections.customizable ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {expandedSections.customizable && (
                <div className="filter-section-content">
                  <div className="radio-list">
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="customizable"
                        checked={filters.customizable === null}
                        onChange={() => handleCustomizableChange(null)}
                      />
                      <span>Todos</span>
                    </label>
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="customizable"
                        checked={filters.customizable === true}
                        onChange={() => handleCustomizableChange(true)}
                      />
                      <span>Solo personalizables</span>
                    </label>
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="customizable"
                        checked={filters.customizable === false}
                        onChange={() => handleCustomizableChange(false)}
                      />
                      <span>No personalizables</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
