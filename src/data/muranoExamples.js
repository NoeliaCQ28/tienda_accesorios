// src/data/muranoExamples.js

import { getMuranosBySize, createExampleMuranoData, calculateMuranoPrice } from '../services/muranoService';

/**
 * Ejemplos de uso del sistema de muranos
 */

// Ejemplo 1: Crear una pulsera con muranos de diferentes tamaños
export const createExampleBracelet = () => {
  return {
    name: "Pulsera Multicolor de Muranos",
    description: "Pulsera con muranos de diferentes tamaños y colores",
    materials: [
      {
        type: "murano",
        size: 8,
        colorId: "rojo-intenso",
        quantity: 3,
        position: "centro"
      },
      {
        type: "murano", 
        size: 6,
        colorId: "azul-marino",
        quantity: 4,
        position: "lateral"
      },
      {
        type: "murano",
        size: 4,
        colorId: "verde-esmeralda", 
        quantity: 6,
        position: "extremos"
      }
    ],
    totalPrice: calculatePrice([
      { size: 8, quantity: 3 },
      { size: 6, quantity: 4 },
      { size: 4, quantity: 6 }
    ])
  };
};

// Ejemplo 2: Collar elegante con muranos grandes
export const createExampleNecklace = () => {
  return {
    name: "Collar Elegante de Muranos #8",
    description: "Collar con muranos grandes en tonos dorados",
    materials: [
      {
        type: "murano",
        size: 8,
        colorId: "dorado",
        quantity: 7,
        position: "principales"
      },
      {
        type: "murano",
        size: 6, 
        colorId: "ambar",
        quantity: 10,
        position: "separadores"
      }
    ],
    estimatedLength: "45cm",
    totalPrice: calculatePrice([
      { size: 8, quantity: 7 },
      { size: 6, quantity: 10 }
    ])
  };
};

// Ejemplo 3: Aretes delicados con muranos pequeños
export const createExampleEarrings = () => {
  return {
    name: "Aretes Delicados de Muranos #3",
    description: "Aretes con muranos pequeños en tonos pasteles",
    materials: [
      {
        type: "murano",
        size: 3,
        colorId: "rosa-claro",
        quantity: 2,
        position: "principales"
      },
      {
        type: "murano",
        size: 3,
        colorId: "lavanda",
        quantity: 2, 
        position: "acentos"
      }
    ],
    totalPrice: calculatePrice([
      { size: 3, quantity: 4 }
    ])
  };
};

// Función auxiliar para calcular precios
function calculatePrice(items) {
  return items.reduce((total, item) => {
    return total + parseFloat(calculateMuranoPrice(item.size, item.quantity));
  }, 0).toFixed(2);
}

// Ejemplo 4: Datos de prueba para desarrollo
export const generateTestData = () => {
  console.log("=== SISTEMA DE MURANOS - DATOS DE PRUEBA ===");
  
  // Mostrar muranos disponibles por tamaño
  [3, 4, 6, 8].forEach(size => {
    console.log(`\n--- MURANOS TAMAÑO #${size} ---`);
    const muranos = getMuranosBySize(size);
    muranos.slice(0, 5).forEach(murano => {
      console.log(`${murano.fullName} - S/. ${murano.price} - SKU: ${murano.sku}`);
    });
    console.log(`Total disponibles: ${muranos.length} colores`);
  });

  // Mostrar ejemplos de productos
  console.log("\n=== EJEMPLOS DE PRODUCTOS ===");
  
  const bracelet = createExampleBracelet();
  console.log(`\n${bracelet.name}:`);
  console.log(`Precio total: S/. ${bracelet.totalPrice}`);
  bracelet.materials.forEach(material => {
    console.log(`- ${material.quantity}x Murano #${material.size} ${material.colorId} (${material.position})`);
  });

  const necklace = createExampleNecklace();
  console.log(`\n${necklace.name}:`);
  console.log(`Precio total: S/. ${necklace.totalPrice}`);
  console.log(`Longitud estimada: ${necklace.estimatedLength}`);

  const earrings = createExampleEarrings();
  console.log(`\n${earrings.name}:`);
  console.log(`Precio total: S/. ${earrings.totalPrice}`);

  // Crear datos de ejemplo para la base de datos
  const exampleData = createExampleMuranoData();
  console.log(`\n=== DATOS DE EJEMPLO GENERADOS ===`);
  console.log(`Total de registros: ${exampleData.length}`);
  
  return {
    bracelet,
    necklace, 
    earrings,
    testData: exampleData
  };
};

// Ejemplo 5: Plantilla de producto personalizable con muranos
export const createMuranoProductTemplate = () => {
  return {
    id: "pulsera_murano_personalizable",
    nombre: "Pulsera de Muranos Personalizable",
    descripcion: "Crea tu pulsera única eligiendo el tamaño y color de los muranos",
    categoria: "pulseras",
    precioBase: 15.00,
    imagen: "https://via.placeholder.com/400x300?text=Pulsera+Muranos",
    
    materialesBase: [
      { 
        materialId: "elastico_transparente", 
        cantidad: 0.25, 
        unidad: "metro",
        descripcion: "Elástico transparente resistente"
      }
    ],
    
    opcionesPersonalizables: [
      {
        id: "muranos_principales",
        nombre: "Muranos Principales",
        tipo: "muranos",
        obligatorio: true,
        descripcion: "Elige el tamaño y color de los muranos principales",
        cantidad: 8, // cantidad estimada
        prioridad: 1
      },
      {
        id: "tamaño_pulsera",
        nombre: "Tamaño de Pulsera", 
        tipo: "selector",
        opciones: ["15cm", "16cm", "17cm", "18cm", "19cm", "20cm"],
        obligatorio: true,
        descripcion: "Selecciona el tamaño de tu pulsera",
        prioridad: 2
      },
      {
        id: "mensaje_personalizado",
        nombre: "Mensaje en la Tarjeta",
        tipo: "texto",
        maxLength: 50,
        obligatorio: false,
        descripcion: "Mensaje personalizado para la tarjeta de regalo",
        prioridad: 3
      }
    ],
    
    instruccionesEspeciales: "Los muranos pueden variar ligeramente en tamaño y tonalidad",
    tiempoElaboracion: "2-3 días hábiles",
    cuidados: "Evitar contacto con agua y perfumes",
    
    activo: true,
    fechaCreacion: new Date().toISOString()
  };
};

export default {
  createExampleBracelet,
  createExampleNecklace,
  createExampleEarrings,
  generateTestData,
  createMuranoProductTemplate
};
