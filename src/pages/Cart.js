import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/Cart.css";
import { FaBars, FaHome, FaInfoCircle, FaDumbbell, FaStore, FaUserPlus, FaUser, FaSignInAlt, FaShoppingCart, FaMoon, FaSun } from 'react-icons/fa';
import { Link, useLocation } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

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
      const cantidad = parseInt(product.cantidad) || 1; // Asegúrate de que cantidad sea un número
      const precio = parseFloat(product.precio) || 0; // Asegúrate de que precio sea un número
      const total = precio * cantidad;
  
      const requestData = {
        productId: product.id,
        nombre: product.nombre,
        cantidad,
        precio,
        total,
        email,
      };
  
      console.log("Enviando datos a /api/comprar:", requestData); // Verifica los datos
  
      const response = await axios.post(
        "http://localhost:5001/api/comprar",
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      alert(response.data.message);
      removeFromCart(product.id);
    } catch (error) {
      console.error("Error en la compra:", error.response?.data || error.message);
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
        nombre: item.nombre, // Asegúrate de que esto sea una cadena
        cantidad: parseInt(item.cantidad) || 1,
        precio: parseFloat(item.precio) || 0,
        total: (parseFloat(item.precio) || 0) * (parseInt(item.cantidad) || 1),
      }));
  
      console.log("Enviando datos a /api/comprar-todo:", cartFormatted); // Verifica los datos
  
      const response = await axios.post(
        "http://localhost:5001/api/comprar-todo",
        { cart: cartFormatted, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      alert(response.data.message);
      saveCart([]);
    } catch (error) {
      console.error("Error en la compra múltiple:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Error en la compra.");
    }
  };
  

  const increaseQuantity = (productId) => {
    const newCart = cart.map(item => {
      if (item.id === productId) {
        return { ...item, cantidad: (item.cantidad || 1) + 1 };
      }
      return item;
    });
    saveCart(newCart);
  };

  const decreaseQuantity = (productId) => {
    const newCart = cart.map(item => {
      if (item.id === productId && (item.cantidad || 1) > 1) {
        return { ...item, cantidad: (item.cantidad || 1) - 1 };
      }
      return item;
    });
    saveCart(newCart);
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
                  <td>
                    <button onClick={() => decreaseQuantity(product.id)}>-</button>
                    {parseInt(product.cantidad) || 1}
                    <button onClick={() => increaseQuantity(product.id)}>+</button>
                  </td>
                  <td>${(parseFloat(product.precio) * (parseInt(product.cantidad) || 1)).toFixed(2)}</td>
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

export default Cart;
