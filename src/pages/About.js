import React, { useState, useEffect } from "react";
import { Link, useLocation } from 'react-router-dom';
import './css/About.css'; // Importar el archivo CSS para el About
import api from '../services/api'; // Importar la instancia de Axios
import { FaBars, FaHome, FaInfoCircle, FaDumbbell, FaStore, FaUserPlus, FaUser, FaSignInAlt, FaShoppingCart, FaComments, FaMoon, FaSun } from 'react-icons/fa';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaArrowRight } from "react-icons/fa";

const About = () => {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();
  const isOpen = navOpen;
  const [tooltip, setTooltip] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [formData, setFormData] = useState({
    name: '',
    comment: ''
  });
  
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get('/api/comments');
        setComments(response.data);
      } catch (error) {
        console.error('Error al obtener comentarios:', error);
      }
    };

    fetchComments();
  }, []);
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };
  
  useEffect(() => {
    document.documentElement.classList.add(theme);
  }, [theme]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/comments', formData);
      
      if (response.status === 200) {
        console.log("Comentario enviado con éxito!"); // Depuración
        setSubmissionStatus('Comentario enviado con éxito!');
        
        // Agregar el nuevo comentario a la lista
        setComments([...comments, { name: formData.name, comment: formData.comment }]);
  
        // Vaciar los campos del formulario
        setFormData({ name: '', comment: '' });
      }
    } catch (error) {
      console.error('Error al enviar comentario:', error);
      setSubmissionStatus('Error al enviar comentario');
    }
  };

  return (
    <div className={`about-container ${navOpen ? "nav-open" : ""}`}>
      {/* Header Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <button className="menu" onClick={() => setNavOpen(!isOpen)}>
          <img src="/imagenes/logo.png" alt="Logo" className="logo" />
        </button>
        {/* Botón para cambiar tema */}
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? <FaMoon /> : <FaSun />}
          {isOpen && <span>{theme === "light" ? "Modo Oscuro" : "Modo Claro"}</span>}
        </button>
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
              {isOpen && <span>{name}</span>}
              {!isOpen && tooltip === name && <div className="tooltip">{name}</div>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`page ${navOpen ? "nav-open" : ""}`}>
        <section className="about-section">
          <h2>Sobre Nosotros</h2>
          <h4>Bienvenido a nuestro gimnasio, donde nos dedicamos a ayudarte a alcanzar tus objetivos de fitness. Ofrecemos una amplia gama de programas y servicios diseñados para todos los niveles de habilidad y condición física.</h4>
        </section>
        <section className="services">
          <h3>Nuestros Servicios</h3>
          <ul>
            <p>Entrenamiento personal</p>
            <p>Clases grupales</p>
            <p>Programas de nutrición</p>
            <p>Evaluaciones de fitness</p>
            <p>Acceso a equipos de última generación</p>
          </ul>
        </section>
        
        <section className="values">
          <h3>Nuestros Valores</h3>
          <p>Nos enorgullecemos de ofrecer un ambiente inclusivo y motivador. Creemos en la importancia de la comunidad y el apoyo mutuo para alcanzar el éxito en el fitness.</p>
        </section>
        
        <section className="testimonials">
          <h3>Testimonios</h3>
          <p>"El mejor gimnasio de la ciudad, con entrenadores altamente calificados y un ambiente increíble."</p>
          <p>"Gracias a sus programas de nutrición, he logrado alcanzar mis objetivos de manera saludable."</p>
        </section>
        
        <section className="comments-section">
          <h3>Comentarios</h3>
          {comments.length === 0 ? (
            <p>No hay comentarios aún.</p>
          ) : (
            <div className="comments-container"> {/* Contenedor para la cuadrícula */}
              {comments.map((comment, index) => (
                <div key={index} className="comment">
                  <h1><strong>{comment.name}</strong></h1>
                  <p>{comment.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Nombre:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="comment">Comentario:</label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <button type="submit">Enviar Comentario</button>
        </form>
        {submissionStatus && <p>{submissionStatus}</p>}
      </div>
      <footer className="footer1">
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
              <a href="#"><i className="fab fa-facebook"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-youtube"></i></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;

