// src/services/muranoService.js

import { muranoCatalog } from '../data/muranoCatalog';

/**
 * Servicio para gestionar muranos de diferentes tamaños
 * Tamaños disponibles: #3, #4, #6, #8
 */

// Configuración de tamaños de muranos
export const MURANO_SIZES = {
  3: {
    size: '#3',
    name: 'Murano Pequeño #3',
    description: 'Murano tamaño #3 (aprox. 6mm)',
    priceMultiplier: 0.8, // 20% más barato que el #8
    diameter: '6mm',
    recommendedUse: ['pulseras delicadas', 'aretes', 'detalles pequeños']
  },
  4: {
    size: '#4',
    name: 'Murano Mediano Pequeño #4',
    description: 'Murano tamaño #4 (aprox. 8mm)',
    priceMultiplier: 0.9, // 10% más barato que el #8
    diameter: '8mm',
    recommendedUse: ['pulseras mixtas', 'collares delicados', 'combinaciones']
  },
  6: {
    size: '#6',
    name: 'Murano Mediano #6',
    description: 'Murano tamaño #6 (aprox. 10mm)',
    priceMultiplier: 1.0, // Mismo precio que el #8
    diameter: '10mm',
    recommendedUse: ['pulseras estándar', 'collares medianos', 'diseños equilibrados']
  },
  8: {
    size: '#8',
    name: 'Murano Grande #8',
    description: 'Murano tamaño #8 (aprox. 12mm)',
    priceMultiplier: 1.0, // Precio base
    diameter: '12mm',
    recommendedUse: ['pulseras statement', 'collares prominentes', 'piezas principales']
  }
};

// Precio base por murano (se multiplica por el factor del tamaño)
const BASE_PRICE = 2.5;

/**
 * Obtiene todos los muranos disponibles para un tamaño específico
 * @param {number} size - Tamaño del murano (3, 4, 6, 8)
 * @returns {Array} Lista de muranos con precios calculados
 */
export const getMuranosBySize = (size) => {
  if (!MURANO_SIZES[size]) {
    throw new Error(`Tamaño de murano no válido: ${size}`);
  }

  const sizeConfig = MURANO_SIZES[size];
  const allMuranos = [];

  Object.entries(muranoCatalog).forEach(([categoryKey, category]) => {
    category.tones.forEach(tone => {
      allMuranos.push({
        ...tone,
        size: size,
        sizeInfo: sizeConfig,
        price: (BASE_PRICE * sizeConfig.priceMultiplier).toFixed(2),
        category: categoryKey,
        categoryName: category.name,
        fullName: `${tone.name} ${sizeConfig.size}`,
        sku: `MUR-${size}-${tone.id.toUpperCase()}`
      });
    });
  });

  return allMuranos;
};

/**
 * Obtiene muranos por categoría y tamaño
 * @param {number} size - Tamaño del murano
 * @param {string} category - Categoría de color
 * @returns {Array} Lista de muranos filtrados
 */
export const getMuranosBySizeAndCategory = (size, category) => {
  const allMuranos = getMuranosBySize(size);
  return allMuranos.filter(murano => murano.category === category);
};

/**
 * Obtiene un murano específico por ID y tamaño
 * @param {number} size - Tamaño del murano
 * @param {string} muranoId - ID del color del murano
 * @returns {Object|null} Murano específico o null
 */
export const getMuranoByIdAndSize = (size, muranoId) => {
  const allMuranos = getMuranosBySize(size);
  return allMuranos.find(murano => murano.id === muranoId) || null;
};

/**
 * Busca muranos por nombre en un tamaño específico
 * @param {number} size - Tamaño del murano
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Array} Lista de muranos que coinciden
 */
export const searchMuranos = (size, searchTerm) => {
  const allMuranos = getMuranosBySize(size);
  const term = searchTerm.toLowerCase();
  
  return allMuranos.filter(murano => 
    murano.name.toLowerCase().includes(term) ||
    murano.fullName.toLowerCase().includes(term) ||
    murano.categoryName.toLowerCase().includes(term)
  );
};

/**
 * Obtiene información de todos los tamaños disponibles
 * @returns {Array} Lista de configuraciones de tamaños
 */
export const getAllSizes = () => {
  return Object.values(MURANO_SIZES);
};

/**
 * Calcula el precio total para una cantidad específica de muranos
 * @param {number} size - Tamaño del murano
 * @param {number} quantity - Cantidad de muranos
 * @returns {number} Precio total
 */
export const calculateMuranoPrice = (size, quantity) => {
  if (!MURANO_SIZES[size]) {
    throw new Error(`Tamaño de murano no válido: ${size}`);
  }

  const sizeConfig = MURANO_SIZES[size];
  const unitPrice = BASE_PRICE * sizeConfig.priceMultiplier;
  return (unitPrice * quantity).toFixed(2);
};

/**
 * Obtiene recomendaciones de uso para un tamaño específico
 * @param {number} size - Tamaño del murano
 * @returns {Array} Lista de usos recomendados
 */
export const getUsageRecommendations = (size) => {
  return MURANO_SIZES[size]?.recommendedUse || [];
};

/**
 * Datos de ejemplo para testing
 */
export const createExampleMuranoData = () => {
  const examples = [];
  
  // Crear ejemplos para cada tamaño
  [3, 4, 6, 8].forEach(size => {
    // Tomar algunos colores de ejemplo de cada categoría
    const sampleColors = [
      'rojo-intenso', 'azul-marino', 'verde-esmeralda', 
      'morado-intenso', 'amarillo-sol', 'dorado'
    ];
    
    sampleColors.forEach(colorId => {
      const murano = getMuranoByIdAndSize(size, colorId);
      if (murano) {
        examples.push({
          ...murano,
          stock: Math.floor(Math.random() * 100) + 20, // Stock aleatorio entre 20-120
          featured: Math.random() > 0.7, // 30% de probabilidad de ser destacado
          lastUpdated: new Date().toISOString()
        });
      }
    });
  });

  return examples;
};

/**
 * Validador de configuración de murano para productos
 * @param {Object} muranoConfig - Configuración del murano
 * @returns {Object} Resultado de validación
 */
export const validateMuranoConfig = (muranoConfig) => {
  const errors = [];
  
  if (!muranoConfig.size || !MURANO_SIZES[muranoConfig.size]) {
    errors.push('Tamaño de murano no válido');
  }
  
  if (!muranoConfig.colorId) {
    errors.push('Color de murano es requerido');
  }
  
  if (muranoConfig.quantity && muranoConfig.quantity <= 0) {
    errors.push('La cantidad debe ser mayor a 0');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  getMuranosBySize,
  getMuranosBySizeAndCategory,
  getMuranoByIdAndSize,
  searchMuranos,
  getAllSizes,
  calculateMuranoPrice,
  getUsageRecommendations,
  createExampleMuranoData,
  validateMuranoConfig,
  MURANO_SIZES,
  BASE_PRICE
};
