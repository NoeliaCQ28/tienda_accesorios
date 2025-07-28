// src/pages/CheckoutPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import allDepartments from '../data/departamentos.json';
import allProvinces from '../data/provincias.json';
import allDistricts from '../data/distritos.json';
import PaymentSelection from '../components/PaymentSelection';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { currentUser } = useAuth();
  const { cart, totalPrice, totalQuantity } = useCart();
  
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    direccion: '',
    referencia: '',
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedProvId, setSelectedProvId] = useState('');
  const [selectedDistId, setSelectedDistId] = useState('');
  const [shippingOption, setShippingOption] = useState(null);

  const shippingOptions = [
    {
      id: 'shalom',
      name: 'SHALOM (CLIENTE PAGA ENVÍO EN AGENCIA)',
      price: 0,
      description: 'Envíos Lunes, miércoles y viernes. El pago del envío se realiza en la misma agencia.'
    },
    {
      id: 'olva',
      name: 'OLVA COURIER (ENVÍO A DOMICILIO)',
      price: 18,
      description: 'El costo se añade al total de tu compra. Para otras provincias, escríbenos a nuestro WhatsApp.'
    }
  ];

  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    setSelectedDeptId(deptId);
    setProvinces(allProvinces[deptId] || []);
    setSelectedProvId(''); 
    setDistricts([]); 
    setSelectedDistId('');
  };
  
  const handleProvinceChange = (e) => {
    const provId = e.target.value;
    setSelectedProvId(provId);
    setDistricts(allDistricts[provId] || []);
    setSelectedDistId('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const goToPaymentStep = (e) => {
    e.preventDefault();
    if (!shippingOption) {
        alert("Por favor, selecciona una tarifa de envío.");
        return;
    }
    setStep(2);
  };
  
  const finalTotal = totalPrice() + (shippingOption?.price || 0);

  return (
    <div className="checkout-layout">
      <div className="checkout-form-container">
        {step === 1 ? (
          <form onSubmit={goToPaymentStep} className="checkout-form">
            <h2>Información de Envío</h2>
            <h4>Información de Contacto</h4>
            <input type="email" name="email" placeholder="Email" value={currentUser?.email || ''} disabled />
            <div className="form-row">
              <input type="text" name="nombre" placeholder="Nombres" value={formData.nombre} onChange={handleChange} required />
              <input type="text" name="apellido" placeholder="Apellidos" value={formData.apellido} onChange={handleChange} required />
            </div>
            <div className="form-row">
              {/* --- LÍNEA CORREGIDA --- */}
              <input type="text" name="dni" placeholder="DNI" value={formData.dni} onChange={handleChange} required minLength="8" maxLength="8" pattern="\d*" title="El DNI debe tener 8 dígitos numéricos" />
              <input type="tel" name="telefono" placeholder="Número de Teléfono" value={formData.telefono} onChange={handleChange} required />
            </div>

            <h4>Dirección de Envío</h4>
            <input type="text" name="direccion" placeholder="Dirección (ej. Jr. Progreso #299)" value={formData.direccion} onChange={handleChange} required />
            <input type="text" name="referencia" placeholder="Referencia (opcional)" value={formData.referencia} onChange={handleChange} />
            <div className="form-row">
              <select value={selectedDeptId} onChange={handleDepartmentChange} required>
                <option value="">Departamento</option>
                {allDepartments.map((dept) => (
                  <option key={dept.id_ubigeo} value={dept.id_ubigeo}> 
                    {dept.nombre_ubigeo}
                  </option>
                ))}
              </select>
              
              <select value={selectedProvId} onChange={handleProvinceChange} disabled={!provinces.length} required>
                <option value="">Provincia</option>
                {provinces.map((prov) => (
                  <option key={prov.id_ubigeo} value={prov.id_ubigeo}>
                    {prov.nombre_ubigeo}
                  </option>
                ))}
              </select>
            </div>
            
            <select value={selectedDistId} onChange={(e) => setSelectedDistId(e.target.value)} disabled={!districts.length} required>
              <option value="">Distrito</option>
              {districts.map((dist) => (
                <option key={dist.id_ubigeo} value={dist.id_ubigeo}>
                  {dist.nombre_ubigeo}
                </option>
              ))}
            </select>

            <h4>Seleccionar tarifa de envío</h4>
            <div className="shipping-options">
              {shippingOptions.map((option) => (
                <label key={option.id} className={`shipping-option ${shippingOption?.id === option.id ? 'selected' : ''}`}>
                  <input type="radio" name="shipping" onChange={() => setShippingOption(option)} required />
                  <div className="shipping-option-details"><strong>{option.name}</strong><span>{option.description}</span></div>
                  <span className="shipping-option-price">{option.price > 0 ? `S/ ${option.price.toFixed(2)}` : 'Pago en destino'}</span>
                </label>
              ))}
            </div>
            <button type="submit" className="submit-order-btn">Continuar con el Pago</button>
          </form>
        ) : (
          <PaymentSelection 
            customerData={formData}
            shippingOption={shippingOption}
            cart={cart}
            totalAmount={finalTotal}
            currentUser={currentUser}
            departmentId={selectedDeptId}
            provinceId={selectedProvId}
            districtId={selectedDistId}
          />
        )}
      </div>

      <div className="order-summary-container">
        <h3>Resumen del Pedido</h3>
        {cart.length > 0 ? (
          cart.map(item => (
            <div key={item.cartItemId} className="summary-item">
              <div className="summary-item-image">
                <img src={item.imagenUrl} alt={item.nombre} />
                <span className="summary-item-quantity">{item.quantity}</span>
              </div>
              <div className="summary-item-details">
                <strong>{item.nombre}</strong>
                {item.customizations && item.customizations.length > 0 && (
                  <div className="summary-customizations-list">
                    {item.customizations.map((cust, index) => (
                      <span key={index} className="summary-item-customization">
                        <strong>{cust.type}:</strong> {cust.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="summary-item-price">
                <span>S/ {(item.precio * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))
        ) : <p>Tu carrito está vacío.</p>}
        <div className="summary-totals">
          <div className="summary-line"><span>Subtotal ({totalQuantity()} productos)</span><span>S/ {totalPrice().toFixed(2)}</span></div>
          <div className="summary-line"><span>Envío</span><span>{shippingOption ? (shippingOption.price > 0 ? `S/ ${shippingOption.price.toFixed(2)}` : 'Pago en destino') : 'Selecciona una opción'}</span></div>
          <div className="summary-line total"><span>Total</span><span>S/ {finalTotal.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;