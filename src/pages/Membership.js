import React, { useEffect, useState } from "react";
import { useLocation, Link } from 'react-router-dom';
import { 
  FaBars, FaHome, FaInfoCircle, FaDumbbell, FaStore, 
  FaUserPlus, FaUser, FaSignInAlt, FaShoppingCart, 
  FaMoon, FaSun, FaCheck, FaStar 
} from 'react-icons/fa';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import './css/membership.css';

const Membership = () => {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const membershipPlans = [
    {
      name: "Básico",
      price: "$29/mes",
      features: [
        "Acceso a equipos básicos",
        "Clases grupales limitadas",
        "Acceso de 6am a 8pm",
        "1 sesión de entrenador personal"
      ],
      bestValue: false
    },
    {
      name: "Avanzado",
      price: "$49/mes",
      features: [
        "Acceso a todos los equipos",
        "Clases grupales ilimitadas",
        "Acceso 24/7",
        "3 sesiones de entrenador personal",
        "Acceso a zona VIP"
      ],
      bestValue: true
    },
    {
      name: "Premium",
      price: "$79/mes",
      features: [
        "Acceso a todos los equipos",
        "Clases grupales ilimitadas",
        "Acceso 24/7",
        "5 sesiones de entrenador personal",
        "Acceso a zona VIP",
        "Nutricionista personal",
        "Regalo mensual"
      ],
      bestValue: false
    }
  ];

  // Mostrar modal con el formulario
  const handleJoin = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  // Enviar los datos al backend
  const handlePayment = async () => {
    if (!email) {
      alert("Por favor, ingresa tu correo electrónico.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/pay-membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, membershipName: selectedPlan.name }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setShowModal(false);
        setEmail("");
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error en el pago:", error);
      alert("Hubo un problema al procesar el pago.");
    }
  };

  return (
    <div className={`membership-container ${navOpen ? "nav-open" : ""}`}>
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
            { path: "/membership", icon: <FaUserPlus />, name: "Membresía" },
            { path: "/profile", icon: <FaUser />, name: "Perfil" },
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
        <h2>Planes de Membresía</h2>
        <p>Elige el plan que mejor se adapte a tus necesidades y comienza tu transformación hoy mismo.</p>

        <div className="membership-grid">
          {membershipPlans.map((plan, index) => (
            <div key={index} className={`membership-card ${plan.bestValue ? "best-value" : ""}`}>
              {plan.bestValue && (
                <div className="best-value-badge">
                  <FaStar /> Mejor Opción
                </div>
              )}
              <h3>{plan.name}</h3>
              <div className="price">{plan.price}</div>
              <ul className="features">
                {plan.features.map((feature, i) => (
                  <ul key={i}>
                    <FaCheck /> {feature}
                  </ul>
                ))}
              </ul>
              <button className="join-button" onClick={() => handleJoin(plan)}>
                Unirse Ahora
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de pago */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Únete a {selectedPlan.name}</h3>
            <p>Por favor, ingresa tu correo para completar la inscripción.</p>
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handlePayment} className="confirm-button">Confirmar</button>
              <button onClick={() => setShowModal(false)} className="cancel-button">Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {/* Footer */}
            <footer className="footer4">
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

export default Membership;
