import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  FaBars, FaHome, FaInfoCircle, FaDumbbell, FaStore, 
  FaUserPlus, FaUser , FaSignInAlt, FaShoppingCart, 
  FaMoon, FaSun, FaSearch 
} from "react-icons/fa";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import "./css/store.css";

const Store = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [navOpen, setNavOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [searchTerm, setSearchTerm] = useState(""); // Estado para la búsqueda
  const [notification, setNotification] = useState(""); // Estado para la notificación
  const navigate = useNavigate();
  const location = useLocation();
  
  // Cargar productos desde la API
  useEffect(() => {
    axios.get("http://localhost:5001/api/productos")
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener productos:", error);
      });

    // Cargar carrito desde localStorage
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  // Theme management
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Manejo de búsqueda
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filtrar productos basados en la búsqueda
  const filteredProducts = products.filter((product) =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agregar producto al carrito
  const addToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    existingCart.push(product);
    localStorage.setItem("cart", JSON.stringify(existingCart));
    setCart(existingCart);
    
    // Mostrar notificación
    setNotification(`${product.nombre} ha sido agregado al carrito.`);
    
    // Ocultar la notificación después de 3 segundos
    setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  return (
    <div className={`store-container ${navOpen ? "nav-open" : ""}`}>
      {/* Barra de búsqueda */}
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input 
          type="text" 
          placeholder="Buscar productos..." 
          value={searchTerm} 
          onChange={handleSearchChange}
        />
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${navOpen ? "open" : ""}`}>
        <button className="menu" onClick={() => setNavOpen(!navOpen)}>
          <img src="/imagenes/logo.png" alt="Logo" className="logo" />
        </button>

        {/* Theme Toggle */}
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? <FaMoon /> : <FaSun />}
          {navOpen && <span>{theme === "light" ? "Modo Oscuro" : "Modo Claro"}</span>}
        </button>

        {/* Navigation */}
        <nav>
          {[
            { path: "/dashboard", icon: <FaHome />, name: "Inicio" },
            { path: "/about", icon: <FaInfoCircle />, name: "Acerca de" },
            { path: "/programs", icon: <FaDumbbell />, name: "Programas" },
            { path: "/store", icon: <FaStore />, name: "Tienda" },
            { path: "/membership", icon: <FaUser Plus />, name: "Membresía" },
            { path: "/profile", icon: <FaUser  />, name: "Perfil" },
            { path: "/login", icon: <FaSignInAlt />, name: "Acceso" },
            { path: "/cart", icon: <FaShoppingCart />, name: "Carrito" }
          ].map(({ path, icon, name }) => (
            <Link
              key={path}
              to={path}
              className={location.pathname === path ? "active" : ""}
            >
              {icon}
              {navOpen && <span>{name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`page ${navOpen ? "nav-open" : ""}`}>
        <h2>Tienda eSport Fitness</h2>
        <p>Compra productos de calidad para mejorar tu rendimiento y estilo de vida.</p>
        
        {/* Notificación */}
        {notification && <div className="notification">{notification}</div>}

        <div className="store-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <img src={product.imagen} alt={product.nombre} />
                <h3>{product.nombre}</h3>
                <p className="price">${product.precio}</p>
                <button onClick={() => addToCart(product)}>Agregar al carrito</button>
              </div>
            ))
          ) : (
            <p>No hay productos disponibles.</p>
          )}
        </div>
      </div>

      <footer className="footer3">
        <div className="footer-container">
          <div className="footer-section">
            <h3>🏋️ MUSCLEGYM</h3>
            <p>Tu gimnasio de confianza para alcanzar tus metas.</p>
            <p>📍 Calle Fitness 123, Medellín</p>
            <p>📞 +57 300 123 4567</p>
          </div>

          <div className="footer-section">
            <h3>🕒 Horarios</h3>
            <p>Lunes a Viernes: 5:00 AM - 10:00 PM</p>
            <p>Sábados: 6:00 AM - 8:00 PM</p>
            <p>Domingos: 7:00 AM - 2:00 PM</p>
          </div>

          <div className="footer-section">
            <h3>🌐 Síguenos</h3>
            <div className="social-icons">
              <a href="#"><FaFacebook /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaTwitter /></a>
              <a href="#"><FaYoutube /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Store;