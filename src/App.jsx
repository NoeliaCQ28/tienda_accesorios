// src/App.jsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { Toaster, toast } from 'react-hot-toast';
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
  { 
    name: 'COLLARES', 
    path: '/category/collares', 
    subItems: [
      { name: 'GARGANTILLAS', path: '/category/gargantillas' }
    ] 
  },
  { 
    name: 'RESINA', 
    path: '/category/resina', 
    subItems: [
      { name: 'LLAVEROS', path: '/category/llaveros' }, 
      { name: 'MARCAPÁGINAS', path: '/category/marcapaginas' }, 
      { name: 'ENMARCAR RECUERDOS', path: '/category/enmarcar-recuerdos' }
    ] 
  },
  { 
    name: 'ACCESORIOS CELULAR', 
    path: '/category/accesorios-celular', 
    subItems: [
      { name: 'PHONE STRAP', path: '/category/phone-strap' }, 
      { name: 'TAPA POLVOS', path: '/category/tapa-polvos' }
    ] 
  },
  { 
    name: 'RECUERDOS', 
    path: '/category/recuerdos', 
    subItems: [
      { name: 'BAUTIZO', path: '/category/bautizo' }, 
      { name: 'PRIMERA COMUNIÓN', path: '/category/primera-comunion' }, 
      { name: 'CONFIRMACIÓN', path: '/category/confirmacion' }, 
      { name: 'XV', path: '/category/xv' }, 
      { name: 'GRADUACIÓN', path: '/category/graduacion' }
    ] 
  },
];

// Componente NavItem mejorado
const NavItem = ({ item, onLinkClick, isMobile = false }) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const hasSubItems = item.subItems && item.subItems.length > 0;

  const handleParentClick = (e) => {
    console.log(`Clicked on: ${item.name}, isMobile: ${isMobile}, hasSubItems: ${hasSubItems}`);
    
    if (hasSubItems && isMobile) {
      // En móvil, prevenir navegación y toggle submenu
      e.preventDefault();
      e.stopPropagation();
      setIsSubMenuOpen(!isSubMenuOpen);
      console.log(`Toggling submenu for ${item.name}: ${!isSubMenuOpen}`);
    } else {
      // En desktop o sin subitems, navegar normalmente
      console.log(`Navigating to: ${item.path}`);
      onLinkClick();
    }
  };

  const handleSubItemClick = () => {
    console.log('Sub-item clicked, closing menu');
    onLinkClick();
  };

  // Reset submenu when switching between mobile/desktop
  useEffect(() => {
    if (!isMobile) {
      setIsSubMenuOpen(false);
    }
  }, [isMobile]);

  return (
    <li className={`nav-item ${hasSubItems ? 'dropdown' : ''} ${isSubMenuOpen ? 'open' : ''}`}>
      <Link 
        to={item.path || '#'} 
        onClick={handleParentClick}
        className="nav-link"
      >
        {item.name}
      </Link>
      {hasSubItems && (
        <ul className="dropdown-menu">
          {item.subItems.map(subItem => (
            <NavItem 
              key={subItem.name} 
              item={subItem} 
              onLinkClick={handleSubItemClick}
              isMobile={isMobile}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { clear: clearCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Detectar cambios en el tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMenuOpen(false); // Cerrar menu al pasar a desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar menú cuando cambia la ruta
  useEffect(() => {
    console.log('Route changed, closing menu');
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Manejar scroll del body cuando el menú está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('menu-open');
    }
    
    // Cleanup
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('menu-open');
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    console.log('Logout clicked');
    setIsMenuOpen(false);
    try {
      await logout();
      clearCart();
      navigate('/');
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const handleMenuToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newMenuState = !isMenuOpen;
    console.log('Menu toggle clicked, new state:', newMenuState);
    setIsMenuOpen(newMenuState);
  };

  const handleLinkClick = () => {
    console.log('Link clicked, closing menu');
    setIsMenuOpen(false);
  };

  const handleSearchOpen = () => {
    console.log('Search opened');
    setIsSearchOpen(true);
    setIsMenuOpen(false);
  };

  const handleBrandClick = () => {
    console.log('Brand clicked');
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <div className="brand">
            <Link to="/" onClick={handleBrandClick}>
              <h1>Accesorios Liath</h1>
            </Link>
          </div>
          
          <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
            <ul className="nav-list">
              {navLinks.map(link => (
                <NavItem 
                  key={link.name} 
                  item={link} 
                  onLinkClick={handleLinkClick}
                  isMobile={isMobile}
                />
              ))}
            </ul>
            
            <div className="user-actions-mobile">
              <button 
                onClick={handleSearchOpen} 
                className="search-icon-btn-mobile"
                type="button"
              >
                <FaSearch /> Buscar
              </button>
              <div className="user-info-mobile">
                {currentUser ? (
                  <>
                    {currentUser?.role === 'admin' && (
                      <Link to="/admin" className="btn-admin" onClick={handleLinkClick}>
                        Panel
                      </Link>
                    )}
                    <Link to="/cuenta" className="btn-account" onClick={handleLinkClick}>
                      Mi Cuenta
                    </Link>
                    <button onClick={handleLogout} className="btn-logout" type="button">
                      Salir
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="btn-login" onClick={handleLinkClick}>
                    Ingresar
                  </Link>
                )}
              </div>
            </div>
          </nav>

          <div className="header-right-actions">
            <div className="user-actions-desktop">
              <button onClick={handleSearchOpen} className="icon-btn" type="button">
                <FaSearch />
              </button>
              <ThemeToggler />
              <CartWidget />
              {currentUser ? (
                <div className="user-info">
                  {currentUser?.role === 'admin' && (
                    <Link to="/admin" className="btn-admin">Panel</Link>
                  )}
                  <Link to="/cuenta" className="user-name-link">
                    <span className="user-name">
                      {currentUser.displayName || currentUser.email}
                    </span>
                  </Link>
                  <button onClick={handleLogout} className="btn-logout" type="button">
                    Salir
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-login">Ingresar</Link>
              )}
            </div>
            
            <button 
              className="menu-toggle" 
              onClick={handleMenuToggle}
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMenuOpen}
              type="button"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
        
        {/* Overlay para cerrar el menú al hacer clic fuera */}
        {isMenuOpen && (
          <div 
            className="menu-overlay" 
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </header>
      
      {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} />}
    </>
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
          <Route path="/admin/add" element={<ProtectedRoute allowedRoles={['admin']}><AddProduct /></ProtectedRoute>} />
          <Route path="/admin/edit/:productId" element={<ProtectedRoute allowedRoles={['admin']}><EditProduct /></ProtectedRoute>} />
        </Routes>
      </main>
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-column">
            <h4>Accesorios Liath</h4>
            <p>Diseños únicos creados con dedicación para realzar tu estilo personal.</p>
          </div>
          <div className="footer-column">
            <h4>Navegación</h4>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/tienda">Tienda</Link></li>
              <li><Link to="/category/recuerdos">Recuerdos</Link></li>
              {currentUser?.role === 'admin' && <li><Link to="/admin">Admin</Link></li>}
            </ul>
          </div>
          <div className="footer-column">
            <h4>Síguenos</h4>
            <p>Encuéntranos en nuestras redes sociales.</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Accesorios Liath. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
