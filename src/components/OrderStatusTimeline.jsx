import React from 'react';
import './OrderStatusTimeline.css';

const orderStatusSteps = [
  { key: 'pending_payment', label: 'Pendiente de Pago' },
  { key: 'payment_in_review', label: 'Pago en Revisión' },
  { key: 'payment_verified', label: 'Pago Verificado' },
  { key: 'shipped', label: 'Enviado' },
  { key: 'delivered', label: 'Entregado' },
  { key: 'canceled', label: 'Cancelado' },
];

function OrderStatusTimeline({ status }) {
  const currentIndex = orderStatusSteps.findIndex(s => s.key === status);
  
  // Si el pedido está cancelado, mostrar solo hasta el punto de cancelación
  const isCancel = status === 'canceled';
  
  return (
    <div className="order-status-timeline">
      {orderStatusSteps.map((step, idx) => {
        let className = 'timeline-step';
        
        if (isCancel && step.key === 'canceled') {
          className = 'timeline-step canceled';
        } else if (isCancel) {
          // Si está cancelado, no mostrar estados posteriores
          className = idx < currentIndex ? 'timeline-step completed' : 'timeline-step';
        } else {
          // Lógica normal para pedidos no cancelados
          if (step.key === 'canceled') {
            return null; // No mostrar "cancelado" en pedidos normales
          }
          className = idx < currentIndex
            ? 'timeline-step completed'
            : idx === currentIndex
            ? 'timeline-step current'
            : 'timeline-step';
        }
        
        return (
          <span key={step.key} className={className}>
            {step.label}
            {idx < orderStatusSteps.length - 1 && !isCancel && <span className="timeline-separator">→</span>}
          </span>
        );
      }).filter(Boolean)}
    </div>
  );
}

export default OrderStatusTimeline;
