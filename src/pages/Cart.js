import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/Cart.css";
import { FaBars, FaHome, FaInfoCircle, FaDumbbell, FaStore, FaUserPlus, FaUser, FaSignInAlt, FaShoppingCart, FaMoon, FaSun } from 'react-icons/fa';
import { Link, useLocation } from "react-router-dom";


const Cart = ({ updateCart = () => {} }) => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [isLoading, setIsLoading] = useState(false);
  const [tooltip, setTooltip] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
    calculateTotal(savedCart);
  }, []);

  const calculateTotal = (cartItems) => {
    const newTotal = cartItems.reduce((sum, product) => {
      const precio = parseFloat(product.precio) || 0;
      const cantidad = parseInt(product.cantidad) || 1;
      return sum + precio * cantidad;
    }, 0);
    setTotal(newTotal);
  };

  const saveCart = (newCart) => {
    setCart(newCart);
    calculateTotal(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    updateCart(newCart);
  };
  const removeFromCart = (productId) => {
    const newCart = cart.filter((item) => item.id !== productId);
    saveCart(newCart);
  };
  
  const purchaseProduct = async (product) => {
    const email = prompt("Ingresa tu correo electrónico para recibir la factura:");
    if (!email) {
      alert("El correo electrónico es obligatorio para la compra.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5001/api/comprar",
        {
          productId: parseInt(product.id),
          cantidad: parseInt(product.cantidad),
          precio: parseFloat(product.precio),
          total: parseFloat(product.precio) * parseInt(product.cantidad),
          email,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message);
      removeFromCart(product.id);
    } catch (error) {
      console.error("Error en la compra:", error);
      alert(error.response?.data?.error || "Error en la compra.");
    }
  };

  const purchaseAll = async () => {
    if (cart.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    const email = prompt("Ingresa tu correo electrónico para recibir la factura:");
    if (!email) {
      alert("El correo electrónico es obligatorio para la compra.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const cartFormatted = cart.map((item) => ({
        productId: parseInt(item.id),
        cantidad: parseInt(item.cantidad),
        precio: parseFloat(item.precio),
        total: parseFloat(item.precio) * parseInt(item.cantidad),
      }));

      const response = await axios.post(
        "http://localhost:5001/api/comprar-todo",
        { cart: cartFormatted, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message);
      saveCart([]);
    } catch (error) {
      console.error("Error en la compra múltiple:", error);
      alert(error.response?.data?.error || "Error en la compra.");
    }
  };

  return (
    <div className="page">
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
      <h2>🛒 Carrito de Compras</h2>
      {cart.length === 0 ? (
        <p>El carrito está vacío.</p>
      ) : (
        <div className="cart-container">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((product) => (
                <tr key={product.id} className="cart-item">
                  <td>
                    <img src={product.imagen} alt={product.nombre} width="50" />
                    <span>{product.nombre}</span>
                  </td>
                  <td>${parseFloat(product.precio).toFixed(2)}</td>
                  <td>{parseInt(product.cantidad)}</td>
                  <td>${(parseFloat(product.precio) * parseInt(product.cantidad)).toFixed(2)}</td>
                  <td>
                    <button onClick={() => purchaseProduct(product)} className="btn-purchase">
                      Comprar
                    </button>
                    <button onClick={() => removeFromCart(product.id)} className="btn-remove">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3"><strong>Total del Carrito:</strong></td>
                <td colSpan="2"><strong>${total.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
          <div className="cart-actions">
            <button className="btn-purchase-all" onClick={purchaseAll} disabled={cart.length === 0}>
              Comprar Todo
            </button>
          </div>
        </div>
      )}
      <footer className="footer6">
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

export default Cart;
