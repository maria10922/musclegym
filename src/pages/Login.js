import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './css/Login.css';

const pageVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.5 } },
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Enviando datos:', { email, password });
      const response = await api.post('/api/login', { email, password });
      console.log('Respuesta de la API:', response.data);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      } else {
        setError('❌ Credenciales incorrectas.');
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError(err.response?.data?.error || '❌ No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="login-wrapper" variants={pageVariants} initial="initial" animate="animate" exit="exit">
  <div className="login-card">
    <div className="login-image-panel">
      <h1>Bienvenidos a MUSCLEGYM !!!</h1>
    </div>
    <div className="login-form-panel">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
        <p className="signup-link">
          <span>¿Nuevo usuario?</span>
          <Link to="/register">Registrarse</Link>
        </p>
      </form>
    </div>
  </div>
</motion.div>

  );
};

export default Login;
