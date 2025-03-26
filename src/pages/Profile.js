import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useProgress } from "./ProgressContext";
import {
  FaBars,
  FaHome,
  FaInfoCircle,
  FaDumbbell,
  FaStore,
  FaUserPlus,
  FaUser,
  FaSignInAlt,
  FaShoppingCart,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import "./css/Profile.css";
import "./css/About.css";

const Profile = () => {
  const { completedExercises, totalExercises } = useProgress();
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();
  const [tooltip, setTooltip] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Calcular progreso de ejercicios
  const progress = user ? (completedExercises / totalExercises) * 100 : 0;

  // Alternar tema oscuro/claro
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };
// Función para cambiar el color de la barra de progreso
const getProgressColor = (progress) => {
  if (progress < 30) return "rgb(0, 200, 0)"; // Verde
  if (progress < 70) return "rgb(255, 200, 0)"; // Amarillo
  return "rgb(200, 0, 0)"; // Rojo
};
  // Obtener perfil desde la API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // Obtiene el token almacenado
        if (!token) {
          throw new Error("No hay token de autenticación");
        }

        const response = await fetch("http://localhost:5001/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error("Error al obtener el perfil:", err);
        setError(err.message);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className={`about-container ${navOpen ? "nav-open" : ""}`}>
      {/* Sidebar */}
      <div className={`sidebar ${navOpen ? "open" : ""}`}>
        <button className="menu" onClick={() => setNavOpen(!navOpen)}>
          <img src="/imagenes/logo.png" alt="Logo" className="logo" />
        </button>

        {/* Botón de cambio de tema */}
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

      {/* Contenido principal */}
      <div className={`page ${navOpen ? "nav-open" : ""}`}>
        <h2>Perfil</h2>

        {error ? (
          <p className="error">Iniciar seccion para ver tu perfil. ⚠️ {error.response.data.error}</p>
        ) : user ? (
          <div className="page-content">
            <h3>Información del Usuario</h3>
            <div className="profile-info">
              <table className="profile-table">
                <tbody>
                  <tr>
                    <td colSpan="2" className="profile-image-cell">
                      <img
                        src={user.profile_picture || "/imagenes/default.png"}
                        alt="Foto de perfil"
                        className="profile-image"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Nombre:</strong></td>
                    <td>{user.name}</td>
                  </tr>
                  <tr>
                    <td><strong>Email:</strong></td>
                    <td>{user.email}</td>
                  </tr>
                  <tr>
                    <td><strong>Programa:</strong></td>
                    <td>{user.programa || "No especificado"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="progress-bar">
  <div
    className="progress"
    style={{
      width: `${progress}%`,
      backgroundColor: getProgressColor(progress),
    }}
  ></div>

            </div>
            <p>{progress.toFixed(0)}% Completado</p>
          </div>
        ) : (
          <p>Cargando perfil...</p>
        )}
      </div>

      {/* Footer */}
      <footer className="footer5">
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

export default Profile;
