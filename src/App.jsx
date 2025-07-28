// src/App.jsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { Toaster } from 'react-hot-toast';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';

// --- Componentes ---
import ThemeToggler from './components/ThemeToggler';
import CartWidget from './components/CartWidget.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import SearchOverlay from './components/SearchOverlay';

// --- Páginas ---
import LandingPage from './pages/LandingPage.jsx';
import HomePage from './pages/HomePage';
import Cart from './pages/Cart';
import CategoryPage from './pages/CategoryPage';
import AuthPage from './pages/AuthPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ProductDetailPage from './pages/ProductDetailPage';
import SearchPage from './pages/SearchPage';

// --- Páginas de Administración ---
import AdminPage from './pages/admin/AdminPage';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';

// Estructura de datos para la navegación
const navLinks = [
  {
    name: 'PULSERAS',
    path: '/category/pulseras',
    subItems: [
      { name: 'MURANO', path: '/category/murano' },
      { 
        name: 'HILO',
        path: '/category/hilo',
        subItems: [
          { name: 'PARA PAREJAS', path: '/category/para-parejas' },
          { name: 'PARA AMIGAS', path: '/category/para-amigas' },
          { name: 'INDIVIDUALES', path: '/category/individuales' },
        ]
      }
    ]
  },
  { name: 'COLLARES', path: '/category/collares', subItems: [{ name: 'GARGANTILLAS', path: '/category/gargantillas' }] },
  { name: 'RESINA', path: '/category/resina', subItems: [{ name: 'LLAVEROS', path: '/category/llaveros' }, { name: 'MARCAPÁGINAS', path: '/category/marcapaginas' }, { name: 'ENMARCAR RECUERDOS', path: '/category/enmarcar-recuerdos' }] },
  { name: 'ACCESORIOS CELULAR', path: '/category/accesorios-celular', subItems: [{ name: 'PHONE STRAP', path: '/category/phone-strap' }, { name: 'TAPA POLVOS', path: '/category/tapa-polvos' }] },
  { name: 'RECUERDOS', path: '/category/recuerdos', subItems: [{ name: 'BAUTIZO', path: '/category/bautizo' }, { name: 'PRIMERA COMUNIÓN', path: '/category/primera-comunion' }, { name: 'CONFIRMACIÓN', path: '/category/confirmacion' }, { name: 'XV', path: '/category/xv' }, { name: 'GRADUACIÓN', path: '/category/graduacion' }] },
];

const NavItem = ({ item, onLinkClick }) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const hasSubItems = item.subItems && item.subItems.length > 0;

  const handleParentClick = (e) => {
    if (hasSubItems && window.innerWidth < 1200) {
      e.preventDefault();
      setIsSubMenuOpen(!isSubMenuOpen);
    } else {
      onLinkClick();
    }
  };

  return (
    <li className={`nav-item ${hasSubItems ? 'dropdown' : ''} ${isSubMenuOpen ? 'open' : ''}`}>
      <Link to={item.path || '#!'} onClick={handleParentClick}>
        {item.name}
      </Link>
      {hasSubItems && (
        <ul className="dropdown-menu">
          {item.subItems.map(subItem => (
            <NavItem key={subItem.name} item={subItem} onLinkClick={onLinkClick} />
          ))}
        </ul>
      )}
    </li>
  );
};


function Header() {
  // --- Usamos directamente currentUser.role para la verificación ---
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { clear: clearCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
  }, [isMenuOpen]);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    try {
      await logout();
      clearCart();
      navigate('/');
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="brand">
          <Link to="/" onClick={() => setIsMenuOpen(false)}><h1>Accesorios Liath</h1></Link>
        </div>
        <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
          <ul className="nav-list">
            {navLinks.map(link => (
              <NavItem key={link.name} item={link} onLinkClick={() => setIsMenuOpen(false)} />
            ))}
          </ul>
          <div className="user-actions-mobile">
                <button onClick={() => { setIsSearchOpen(true); setIsMenuOpen(false); }} className="search-icon-btn-mobile">
                    <FaSearch /> Buscar
                </button>
                <div className="user-info-mobile">
                    {currentUser ? (
                        <>
                            {/* --- CORRECCIÓN: Botón de Panel para móvil --- */}
                            {currentUser?.role === 'admin' && <Link to="/admin" className="btn-admin" onClick={() => setIsMenuOpen(false)}>Panel</Link>}
                            <Link to="/cuenta" className="btn-account" onClick={() => setIsMenuOpen(false)}>Mi Cuenta</Link>
                            <button onClick={handleLogout} className="btn-logout">Salir</button>
                        </>
                    ) : (
                        <Link to="/login" className="btn-login" onClick={() => setIsMenuOpen(false)}>Ingresar</Link>
                    )}
                </div>
            </div>
        </nav>
        <div className="header-right-actions">
          <div className="user-actions-desktop">
            <button onClick={() => setIsSearchOpen(true)} className="icon-btn"><FaSearch /></button>
            <ThemeToggler />
            <CartWidget />
            {currentUser ? (
              <div className="user-info">
                {/* --- CORRECCIÓN: Botón de Panel para escritorio --- */}
                {currentUser?.role === 'admin' && <Link to="/admin" className="btn-admin">Panel</Link>}
                <Link to="/cuenta" className="user-name-link"><span className="user-name">{currentUser.displayName || currentUser.email}</span></Link>
                <button onClick={handleLogout} className="btn-logout">Salir</button>
              </div>
            ) : (
              <Link to="/login" className="btn-login">Ingresar</Link>
            )}
          </div>
          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
      {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} />}
    </header>
  );
}


function App() {
  const { currentUser } = useAuth();
  return (
      <div className="page-container">
        <Toaster position="bottom-right" reverseOrder={false} />
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/tienda" element={<HomePage />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/producto/:productId" element={<ProductDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/cuenta" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute>} />
            {/* Las rutas anidadas de admin se manejan dentro de AdminPage, por lo que estas son redundantes y se pueden quitar */}
            {/* <Route path="/admin/add" element={<ProtectedRoute allowedRoles={['admin']}><AddProduct /></ProtectedRoute>} /> */}
            {/* <Route path="/admin/edit/:productId" element={<ProtectedRoute allowedRoles={['admin']}><EditProduct /></ProtectedRoute>} /> */}
          </Routes>
        </main>
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-column"><h4>Accesorios Liath</h4><p>Diseños únicos creados con dedicación para realzar tu estilo personal.</p></div>
            <div className="footer-column">
              <h4>Navegación</h4>
              <ul>
                <li><Link to="/">Inicio</Link></li>
                <li><Link to="/tienda">Tienda</Link></li>
                <li><Link to="/category/recuerdos">Recuerdos</Link></li>
                 {/* --- CORRECCIÓN: Botón de Panel en el Footer --- */}
                {currentUser?.role === 'admin' && <li><Link to="/admin">Admin</Link></li>}
              </ul>
            </div>
            <div className="footer-column"><h4>Síguenos</h4><p>Encuéntranos en nuestras redes sociales.</p></div>
          </div>
          <div className="footer-bottom"><p>© {new Date().getFullYear()} Accesorios Liath. Todos los derechos reservados.</p></div>
        </footer>
      </div>
  );
}

// NO exportamos un Wrapper, solo el componente App.
// El Router se encargará de esto en main.jsx
export default App;