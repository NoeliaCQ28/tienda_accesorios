// src/context/SearchContext.jsx

import React, { createContext, useState, useContext, useCallback } from 'react';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch debe usarse dentro de un SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    priceRange: { min: '', max: '' },
    sortBy: '', // 'price-asc', 'price-desc', 'name-asc', 'name-desc'
    categories: [],
    colors: [],
    customizable: null // null, true, false
  });

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      priceRange: { min: '', max: '' },
      sortBy: '',
      categories: [],
      colors: [],
      customizable: null
    });
  }, []);

  const resetFiltersExceptCategory = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      priceRange: { min: '', max: '' },
      sortBy: '',
      colors: [],
      customizable: null
    }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    resetFilters();
  }, [resetFilters]);

  // Función para aplicar filtros a una lista de productos
  const applyFilters = useCallback((products) => {
    let filtered = [...products];

    // Filtro de rango de precios
    if (filters.priceRange.min !== '' || filters.priceRange.max !== '') {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.precio);
        const min = filters.priceRange.min ? parseFloat(filters.priceRange.min) : 0;
        const max = filters.priceRange.max ? parseFloat(filters.priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Filtro de categorías
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        product.tags && filters.categories.some(category => 
          product.tags.includes(category)
        )
      );
    }

    // Filtro de colores
    if (filters.colors.length > 0) {
      filtered = filtered.filter(product => 
        product.colores && filters.colors.some(color => 
          product.colores.includes(color)
        )
      );
    }

    // Filtro de personalizable
    if (filters.customizable !== null) {
      filtered = filtered.filter(product => 
        Boolean(product.customizable) === filters.customizable
      );
    }

    // Ordenamiento
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio));
          break;
        case 'price-desc':
          filtered.sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio));
          break;
        case 'name-asc':
          filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
          break;
        case 'name-desc':
          filtered.sort((a, b) => b.nombre.localeCompare(a.nombre));
          break;
        default:
          break;
      }
    }

    return filtered;
  }, [filters]);

  const value = {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    resetFilters,
    resetFiltersExceptCategory,
    clearSearch,
    applyFilters
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
