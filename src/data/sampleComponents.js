// src/data/sampleComponents.js

export const sampleComponents = [
  {
    id: 'comp_001',
    name: 'Murano Corazón Rojo',
    type: 'murano',
    subtype: 'corazón',
    color: '#FF0000',
    colorName: 'Rojo',
    sku: 'MUR-CO-RO-001',
    stock: 25,
    minStock: 5,
    costPrice: 2.50,
    suggestedMargin: 80,
    calculatedPrice: 4.50,
    supplier: 'Cristales Lima',
    supplierContact: '+51 987 654 321',
    description: 'Hermoso murano en forma de corazón de color rojo intenso, perfecto para pulseras románticas.',
    tags: ['romántico', 'elegante', 'brillante'],
    usageCount: 15,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-15'),
    images: []
  },
  {
    id: 'comp_002',
    name: 'Dije de Acero Dorado',
    type: 'dije',
    subtype: 'metal',
    color: '#FFD700',
    colorName: 'Dorado',
    sku: 'DIJ-ME-DO-002',
    stock: 8,
    minStock: 10,
    costPrice: 5.00,
    suggestedMargin: 60,
    calculatedPrice: 8.00,
    supplier: 'MetalCraft Peru',
    supplierContact: 'metalcraft@email.com',
    description: 'Dije de acero inoxidable con baño dorado, diseño de estrella, resistente al agua.',
    tags: ['resistente', 'dorado', 'estrella'],
    usageCount: 22,
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-12-10'),
    images: []
  },
  {
    id: 'comp_003',
    name: 'Hilo Chino Negro',
    type: 'hilo',
    subtype: 'chino',
    color: '#000000',
    colorName: 'Negro',
    sku: 'HIL-CH-NE-003',
    stock: 0,
    minStock: 3,
    costPrice: 0.75,
    suggestedMargin: 100,
    calculatedPrice: 1.50,
    supplier: 'Hilos & Más',
    supplierContact: '+51 912 345 678',
    description: 'Hilo chino de alta calidad, color negro profundo, ideal para pulseras elegantes.',
    tags: ['básico', 'elegante', 'versátil'],
    usageCount: 45,
    createdAt: new Date('2024-10-20'),
    updatedAt: new Date('2024-12-01'),
    images: []
  },
  {
    id: 'comp_004',
    name: 'Perla Cultivada Blanca',
    type: 'perla',
    subtype: 'cultivada',
    color: '#FFFFFF',
    colorName: 'Blanco',
    sku: 'PER-CU-BL-004',
    stock: 50,
    minStock: 15,
    costPrice: 3.20,
    suggestedMargin: 75,
    calculatedPrice: 5.60,
    supplier: 'Perlas del Pacífico',
    supplierContact: 'perlas@pacifico.pe',
    description: 'Perlas cultivadas de agua dulce, forma redonda, lustre natural excepcional.',
    tags: ['natural', 'clásico', 'elegante', 'boda'],
    usageCount: 33,
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-12-05'),
    images: []
  },
  {
    id: 'comp_005',
    name: 'Cadena de Acero Plateada',
    type: 'cadena',
    subtype: 'acero',
    color: '#C0C0C0',
    colorName: 'Plateado',
    sku: 'CAD-AC-PL-005',
    stock: 12,
    minStock: 8,
    costPrice: 4.80,
    suggestedMargin: 50,
    calculatedPrice: 7.20,
    supplier: 'Cadenas Premium',
    supplierContact: '+51 998 777 666',
    description: 'Cadena de acero inoxidable con acabado plateado, eslabones pequeños, muy resistente.',
    tags: ['resistente', 'base', 'plateado'],
    usageCount: 18,
    createdAt: new Date('2024-11-25'),
    updatedAt: new Date('2024-12-12'),
    images: []
  }
];

// Función para cargar datos de ejemplo a Firebase (usar solo una vez)
export const loadSampleData = async (db) => {
  const { collection, addDoc } = await import('firebase/firestore');
  
  try {
    for (const component of sampleComponents) {
      const { id, ...componentData } = component; // Remover el ID manual
      await addDoc(collection(db, 'components'), componentData);
    }
    console.log('Datos de ejemplo cargados exitosamente');
  } catch (error) {
    console.error('Error al cargar datos de ejemplo:', error);
  }
};
