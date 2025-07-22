// src/pages/OrderConfirmationPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db } from '../firebaseConfig';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import './OrderConfirmationPage.css';

import yapeQr from '../assets/yape-qr-placeholder.jpg';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const orderDocRef = doc(db, 'orders', orderId);
        const orderDocSnap = await getDoc(orderDocRef);
        if (orderDocSnap.exists()) {
          setOrder({ id: orderDocSnap.id, ...orderDocSnap.data() });
        } else {
          toast.error("No se encontró la orden.");
        }
      } catch (error) {
        toast.error("Error al buscar la orden.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Por favor, selecciona un archivo primero.");
      return;
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    let compressedFile;
    try {
      toast.loading('Comprimiendo imagen...');
      compressedFile = await imageCompression(file, options);
      toast.dismiss();
    } catch (error) {
      toast.dismiss();
      toast.error('No se pudo comprimir la imagen.');
      console.error(error);
      return;
    }

    const storage = getStorage();
    const storageRef = ref(storage, `comprobantes/${orderId}/${compressedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, compressedFile);
    toast.loading('Subiendo comprobante...');

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        toast.dismiss();
        toast.error("Error al subir la imagen.");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          const orderDocRef = doc(db, 'orders', orderId);
          await updateDoc(orderDocRef, {
            proofOfPaymentUrl: downloadURL,
            status: 'payment_in_review'
          });
          toast.dismiss();
          toast.success("¡Comprobante enviado! Redirigiendo a tu perfil...");

          setTimeout(() => {
            navigate('/cuenta');
          }, 2000);
        });
      }
    );
  };

  if (loading) return <div className="loading-container">Cargando detalles del pedido...</div>;
  if (!order) return <div className="loading-container">No se pudo cargar la información del pedido.</div>;

  const renderPaymentDetails = () => {
    switch (order.paymentMethod) {
      case 'yape':
        return (
          <div className="payment-instructions-card">
            <h3>Método de pago: Yape</h3>
            <p><strong>Nombre:</strong> Noelia Jhanira Cerna Quiroga</p>
            <p><strong>Número:</strong> 987 869 687</p>
            <p className="instructions-text">¡Gracias por tu compra! Escanea el QR o usa nuestro número. Luego, sube tu comprobante aquí abajo.</p>
            <img src={yapeQr} alt="Código QR de Yape" className="qr-code" />
          </div>
        );
      case 'plin':
        return (
          <div className="payment-instructions-card">
            <h3>Método de pago: Plin</h3>
            <p><strong>Nombre:</strong> Noelia Jhanira Cerna Quiroga</p>
            <p><strong>Número:</strong> 987 869 687</p>
            <p className="instructions-text">¡Gracias por tu compra! Realiza el pago a nuestro Plin y sube una captura.</p>
          </div>
        );
      default:
        return <p>Contacta con nosotros para coordinar el pago.</p>;
    }
  };

  return (
    <div className="confirmation-page">
      <div className="confirmation-main">
        <div className="confirmation-header">
          <h2>¡Tu orden fue recibida!</h2>
          <p className="order-number">Pedido: #{order.id.substring(0, 8).toUpperCase()}</p>
        </div>

        {/* ***** INICIO DE LA MODIFICACIÓN ***** */}
        <div className="order-summary-card">
          <h4>Resumen de tu Compra</h4>
          <ul className="order-summary-list">
            {order.items.map((item, index) => (
              <li key={`${item.id}-${index}`} className="order-summary-item">
                <img src={item.imagenUrl} alt={item.nombre} className="summary-item-thumbnail" />
                <div className="summary-item-info">
                  <span className="item-name">{item.quantity} x {item.nombre}</span>
                  {item.customization && (
                    <span className="item-customization">
                      (Color: {item.customization.value})
                    </span>
                  )}
                </div>
                <span className="item-price">S/ {(item.precio * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="order-summary-total">
            <strong>Total del Pedido: S/ {order.total.toFixed(2)}</strong>
          </div>
        </div>
        {/* ***** FIN DE LA MODIFICACIÓN ***** */}
        
        {renderPaymentDetails()}

        <div className="upload-section">
          <h4>Subir comprobante de pago</h4>
          {order.status === 'payment_in_review' || order.proofOfPaymentUrl ? (
            <div className="upload-success">
              <p>✅ ¡Ya hemos recibido tu comprobante! Lo revisaremos pronto.</p>
              <Link to="/cuenta">Ir a mis pedidos</Link>
            </div>
          ) : (
            <>
              <input type="file" onChange={handleFileChange} accept="image/*" />
              {file && <p>Archivo seleccionado: {file.name}</p>}
              {uploadProgress > 0 && <progress value={uploadProgress} max="100" />}
              <button onClick={handleUpload} className="upload-btn">Enviar Comprobante</button>
            </>
          )}
        </div>
      </div>

      <div className="confirmation-sidebar">
        <h3>¿Necesitas Ayuda?</h3>
        <p>Si tienes alguna duda con tu pago o pedido, no dudes en contactarnos.</p>
        <p><strong>Gmail:</strong> accesoriosliath@gmail.com</p>
        <p><strong>Teléfono:</strong> +51 987 869 687</p>
        <a href="https://wa.me/51987869687" target="_blank" rel="noopener noreferrer" className="whatsapp-btn">Escribir a WhatsApp</a>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;