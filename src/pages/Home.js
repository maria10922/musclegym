import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaHome, FaInfoCircle, FaDumbbell, FaStore, FaUserPlus, FaUser, FaSignInAlt, FaShoppingCart, FaMoon, FaSun } from 'react-icons/fa';
import './css/Home.css';

const Home = () => {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();
  const isOpen = navOpen;
  const [tooltip, setTooltip] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className={`about-container ${navOpen ? "nav-open" : ""}`}>
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <button className="menu" onClick={() => setNavOpen(!isOpen)}>
          <img src="/imagenes/logo.png" alt="Logo" className="logo" />
        </button>

        {/* Theme Toggle */}
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? <FaMoon /> : <FaSun />}
          {isOpen && <span>{theme === "light" ? "Modo Oscuro" : "Modo Claro"}</span>}
        </button>

        {/* Navigation */}
        <nav>
          {[
            { path: "/login", icon: <FaSignInAlt />, name: "Acceso" },
            { path: "/register", icon: <FaUserPlus />, name: "Registrarse" },
            
          ].map(({ path, icon, name }) => (
            <Link
              key={path}
              to={path}
              className={location.pathname === path ? "active" : ""}
              onMouseEnter={() => setTooltip(name)}
              onMouseLeave={() => setTooltip("")}
            >
              {icon}
              {isOpen && <span>{name}</span>}
              {!isOpen && tooltip === name && <div className="tooltip">{name}</div>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`page ${navOpen ? "nav-open" : ""}`}>
        <header className="header">
          <h1>Bienvenido a <span className="highlight">MUSCLEGYM</span></h1>
          <p className="subtitle">Tu destino para un entrenamiento efectivo y saludable.</p>
          
          <div className="button-container">
            
            <Link to="/login">
              <button className="btn">Ingresa Ahora</button>
            </Link>
          </div>
        </header>

        {/* Features Section */}
        <section className="features">
          <h2>¿Qué ofrecemos en <span className="highlight">MUSCLEGYM</span>?</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Rutinas Personalizadas</h3>
              <p>Accede a entrenamientos adaptados a tu nivel y objetivos.</p>
            </div>
            <div className="feature-card">
              <h3>Seguimiento de Progreso</h3>
              <p>Registra tus avances y mantente motivado con estadísticas detalladas.</p>
            </div>
            <div className="feature-card">
              <h3>Planes de Nutrición</h3>
              <p>Recibe recomendaciones de alimentación según tu entrenamiento.</p>
            </div>
            <div className="feature-card">
              <h3>Clases en Vivo</h3>
              <p>Únete a sesiones en línea con entrenadores certificados.</p>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
  
};

export default Home;
