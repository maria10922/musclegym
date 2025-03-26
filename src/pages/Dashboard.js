import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars, FaHome, FaInfoCircle, FaDumbbell, FaStore, FaUserPlus, FaUser,
  FaSignInAlt, FaShoppingCart, FaMoon, FaSun,
} from "react-icons/fa";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import axios from "axios";
import "./css/Dashboard.css";

const Dashboard = () => {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [productos, setProductos] = useState([]);
  const [tooltip, setTooltip] = useState("");
  
  // Carrusel de imágenes
  const images = [
    "/imagenes/galeria1.jpg",
    "/imagenes/galeria2.jpg",
    "/imagenes/galeria3.jpg",
    "/imagenes/galeria5.jpg",
    "/imagenes/galeria6.jpg",
  ];
  const [index, setIndex] = useState(2);

  // Cargar los primeros 3 productos de la API
  useEffect(() => {
    axios.get("http://localhost:5001/api/productos")
      .then((response) => setProductos(response.data.slice(0, 3)))
      .catch((error) => console.error("Error al obtener productos:", error));
  }, []);

  // Avanzar el carrusel automáticamente cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Alternar entre modo claro y oscuro
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className={`dashboard-container ${navOpen ? "nav-open" : ""}`}>
      
      {/* Sidebar */}
      <div className={`sidebar ${navOpen ? "open" : ""}`}>
        <button className="menu" onClick={() => setNavOpen(!navOpen)}>
          <img src="/imagenes/logo.png" alt="Logo" className="logo" />
        </button>

        {/* Botón para cambiar tema */}
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? <FaMoon /> : <FaSun />}
          {navOpen && <span>{theme === "light" ? "Modo Oscuro" : "Modo Claro"}</span>}
        </button>

        {/* Menú de navegación */}
        <nav>
          {[
            { path: "/dashboard", icon: <FaHome />, name: "Inicio" },
            { path: "/about", icon: <FaInfoCircle />, name: "Acerca de" },
            { path: "/programs", icon: <FaDumbbell />, name: "Programas" },
            { path: "/store", icon: <FaStore />, name: "Tienda" },
            { path: "/membership", icon: <FaUserPlus />, name: "Membresía" },
            { path: "/profile", icon: <FaUser />, name: "Perfil" },
            { path: "/login", icon: <FaSignInAlt />, name: "Acceso" },
            { path: "/cart", icon: <FaShoppingCart />, name: "Carrito" },
          ].map(({ path, icon, name }) => (
            <Link
              key={path}
              to={path}
              className={location.pathname === path ? "active" : ""}
              onMouseEnter={() => setTooltip(name)}
              onMouseLeave={() => setTooltip("")}
            >
              {icon}
              {navOpen && <span>{name}</span>}
              {!navOpen && tooltip === name && <div className="tooltip">{name}</div>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Contenido Principal */}
      <div className="content">
        <header className="hero">
          <div className="hero-content">
            <h1>Haz que tu <br /><span>CUERPO ESTÉ EN FORMA</span></h1>
            <p>Tu bienestar está en tus manos. Explora los beneficios de nuestros programas diseñados para fortalecer tu cuerpo, mejorar tu rendimiento y transformar tu vida.</p>
          </div>
        </header>

        {/* Programas gratuitos */}
        <section className="programas">
          <h2>Programas gratuitos</h2>
          <div className="cards">
            {[
              { img: "Ayuda para principiantes.jpg", title: "Ayuda para principiantes" },
              { img: "Entrenamiento avanzado.jpg", title: "Entrenamiento avanzado" },
              { img: "Perdida de peso.jpg", title: "Pérdida de peso" },
              { img: "Sin equipo.jpg", title: "Sin equipo" },
              { img: "Entrenamiento de fuerza.jpg", title: "Entrenamiento de fuerza" }
            ].map((programa, index) => (
              <div className="card" key={index}>
                <img src={`/imagenes/${programa.img}`} alt={programa.title} />
                <h3>{programa.title}</h3>
                <Link to={`/registrar?programa=${encodeURIComponent(programa.title)}`} className="btn">Comienza hoy</Link>
              </div>
            ))}
          </div>
        </section>

        {/* Sección de mercancía */}
        <section className="mercancia">
          <h2>Consigue nuestra mercancía</h2>
          <div className="productos">
            {productos.length > 0 ? (
              productos.map((producto, index) => (
                <div className="producto" key={index}>
                  <img src={producto.imagen} alt={producto.nombre} />
                  <p>{producto.nombre}</p>
                </div>
              ))
            ) : (
              <p>Cargando productos...</p>
            )}
          </div>
          <Link to="/store" className="btn-ver">Ver toda la mercancía</Link>
        </section>

        {/* Carrusel de imágenes */}
        <div className="carrusel">
          <div className="carrusel-3d">
            {images.map((src, i) => {
              const position = (i - index + images.length) % images.length;
              return (
                <img
                  key={i}
                  src={src}
                  alt={`Imagen ${i}`}
                  className={position === 2 ? "active" : ""}
                  style={{
                    transform: `translateX(${(position - 2) * 100}px) rotateY(${(position - 2) * 10}deg) translateZ(${200 - Math.abs(position - 2) * 100}px)`,
                    opacity: position === 2 ? 1 : 0.6,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      <footer className="footer0">
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

export default Dashboard;
