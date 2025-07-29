// src/hooks/useComponentUsage.js

import { useEffect } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const useComponentUsage = () => {
  
  // Función para incrementar el contador de uso de un componente
  const incrementComponentUsage = async (componentId) => {
    try {
      const componentRef = doc(db, 'components', componentId);
      await updateDoc(componentRef, {
        usageCount: increment(1),
        lastUsed: new Date()
      });
    } catch (error) {
      console.error('Error al actualizar uso del componente:', error);
    }
  };

  // Función para decrementar el contador de uso de un componente
  const decrementComponentUsage = async (componentId) => {
    try {
      const componentRef = doc(db, 'components', componentId);
      await updateDoc(componentRef, {
        usageCount: increment(-1)
      });
    } catch (error) {
      console.error('Error al decrementar uso del componente:', error);
    }
  };

  // Función para actualizar contadores cuando se modifica un producto
  const updateComponentUsage = async (oldComponentIds = [], newComponentIds = []) => {
    try {
      // Componentes que se removieron
      const removedComponents = oldComponentIds.filter(id => !newComponentIds.includes(id));
      // Componentes que se agregaron
      const addedComponents = newComponentIds.filter(id => !oldComponentIds.includes(id));

      // Decrementar contadores de componentes removidos
      await Promise.all(
        removedComponents.map(componentId => decrementComponentUsage(componentId))
      );

      // Incrementar contadores de componentes agregados
      await Promise.all(
        addedComponents.map(componentId => incrementComponentUsage(componentId))
      );

    } catch (error) {
      console.error('Error al actualizar contadores de uso:', error);
    }
  };

  return {
    incrementComponentUsage,
    decrementComponentUsage,
    updateComponentUsage
  };
};

export default useComponentUsage;
