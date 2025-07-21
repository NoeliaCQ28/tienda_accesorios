import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
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

function App() {
  const { currentUser, logout } = useAuth();
  const { clear: clearCart } = useCart();
  const navigate = useNavigate();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isMenuOpen]);

  const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen);
  
  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  };

  const handleDropdownToggle = (dropdown) => {
    setOpenDropdown(prev => (prev === dropdown ? null : dropdown));
  };

  const handleCategoryClick = (e, category) => {
    if (isMobile) {
      e.preventDefault();
      handleDropdownToggle(category);
    } else {
      // En escritorio, permite la navegación y cierra el menú
      closeAllMenus();
    }
  };

  const handleLogout = async () => {
    closeAllMenus();
    try {
      clearCart();
      await logout();
      navigate('/'); 
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <div className="page-container">
      <Toaster position="bottom-right" reverseOrder={false} />
      
      {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} />}

      <header className="app-header">
        <div className="header-content">
          <div className="brand">
            <Link to="/" onClick={closeAllMenus} style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1>Accesorios Liath</h1>
            </Link>
          </div>
          
          <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
            <ul className="nav-list">
              <li className={`nav-item dropdown ${openDropdown === 'pulseras' ? 'open' : ''}`}>
                <Link to="/category/pulseras" onClick={(e) => handleCategoryClick(e, 'pulseras')}>PULSERAS</Link>
                <ul className="dropdown-menu">
                  <li><Link to="/category/murano" onClick={closeAllMenus}>MURANO</Link></li>
                  <li><Link to="/category/para-parejas" onClick={closeAllMenus}>PARA PAREJAS</Link></li>
                </ul>
              </li>
              <li className={`nav-item dropdown ${openDropdown === 'collares' ? 'open' : ''}`}>
                <Link to="/category/collares" onClick={(e) => handleCategoryClick(e, 'collares')}>COLLARES</Link>
                <ul className="dropdown-menu">
                    <li><Link to="/category/gargantillas" onClick={closeAllMenus}>GARGANTILLAS</Link></li>
                </ul>
              </li>
              <li className={`nav-item dropdown ${openDropdown === 'resina' ? 'open' : ''}`}>
                  <Link to="/category/resina" onClick={(e) => handleCategoryClick(e, 'resina')}>RESINA</Link>
                  <ul className="dropdown-menu">
                      <li><Link to="/category/llaveros" onClick={closeAllMenus}>LLAVEROS</Link></li>
                      <li><Link to="/category/marcapaginas" onClick={closeAllMenus}>MARCAPAGINAS</Link></li>
                      <li><Link to="/category/enmarcar-recuerdos" onClick={closeAllMenus}>ENMARCAR RECUERDOS</Link></li>
                  </ul>
              </li>
              <li className={`nav-item dropdown ${openDropdown === 'accesorios' ? 'open' : ''}`}>
                  <Link to="/category/accesorios-celular" onClick={(e) => handleCategoryClick(e, 'accesorios')}>ACCESORIOS CELULAR</Link>
                  <ul className="dropdown-menu">
                      <li><Link to="/category/phone-strap" onClick={closeAllMenus}>PHONE STRAP</Link></li>
                      <li><Link to="/category/tapa-polvos" onClick={closeAllMenus}>TAPA POLVOS</Link></li>
                  </ul>
              </li>
              <li className={`nav-item dropdown ${openDropdown === 'recuerdos' ? 'open' : ''}`}>
                  <Link to="/category/recuerdos" onClick={(e) => handleCategoryClick(e, 'recuerdos')}>RECUERDOS</Link>
                  <ul className="dropdown-menu">
                      <li><Link to="/category/bautizo" onClick={closeAllMenus}>BAUTIZO</Link></li>
                      <li><Link to="/category/primera-comunion" onClick={closeAllMenus}>PRIMERA COMUNIÓN</Link></li>
                      <li><Link to="/category/confirmacion" onClick={closeAllMenus}>CONFIRMACIÓN</Link></li>
                      <li><Link to="/category/xv" onClick={closeAllMenus}>XV</Link></li>
                      <li><Link to="/category/graduacion" onClick={closeAllMenus}>GRADUACIÓN</Link></li>
                  </ul>
              </li>
            </ul>
            
            <div className="user-actions-mobile">
                <button onClick={() => { setIsSearchOpen(true); closeAllMenus(); }} className="search-icon-btn-mobile">
                    <FaSearch /> Buscar
                </button>
                <div className="user-info-mobile">
                    {currentUser ? (
                        <>
                            {currentUser.role === 'admin' && <Link to="/admin" className="btn-admin" onClick={closeAllMenus}>Panel</Link>}
                            <Link to="/cuenta" className="btn-account" onClick={closeAllMenus}>Mi Cuenta</Link>
                            <button onClick={handleLogout} className="btn-logout">Salir</button>
                        </>
                    ) : (
                        <Link to="/login" className="btn-login" onClick={closeAllMenus}>Ingresar</Link>
                    )}
                </div>
            </div>
          </nav>

           <div className="header-right-actions">
              <div className="user-actions-desktop">
                <button onClick={() => setIsSearchOpen(true)} className="icon-btn">
                  <FaSearch />
                </button>
                <ThemeToggler />
                <CartWidget />
                {currentUser ? (
                  <div className="user-info">
                    {currentUser.role === 'admin' && (
                      <Link to="/admin" className="btn-admin">Panel</Link>
                    )}
                    <Link to="/cuenta" className="user-name-link">
                      <span className="user-name">{currentUser.displayName || currentUser.email}</span>
                    </Link>
                    <button onClick={handleLogout} className="btn-logout">Salir</button>
                  </div>
                ) : (
                  <Link to="/login" className="btn-login">Ingresar</Link>
                )}
              </div>
              <button className="menu-toggle" onClick={handleMenuToggle}>
                {isMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
        </div>
      </header>
      
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
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute>} />
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
              <li><Link to="/admin">Admin</Link></li>
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