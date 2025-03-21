import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import './css/Register.css';

const pageVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.5 } },
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    weight: '',
    height: '',
    profilePicture: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePicture: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('weight', formData.weight);
    formDataToSend.append('height', formData.height);
    if (formData.profilePicture) {
      formDataToSend.append('profilePicture', formData.profilePicture);
    }

    try {
      const response = await axios.post('http://localhost:5001/api/register', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert(response.data.message);
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      alert('Error al registrar. Inténtalo de nuevo.');
    }
  };

  return (
    <motion.div className="register-container" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="left">
        <h2>Registro</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <input type="text" name="name" placeholder="Nombre completo" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <input type="email" name="email" placeholder="Correo electrónico" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <input type="number" name="weight" placeholder="Peso (kg)" value={formData.weight} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <input type="number" name="height" placeholder="Estatura (cm)" value={formData.height} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <input type="file" name="profilePicture" accept="image/*" onChange={handleFileChange} />
          </div>
          <button type="submit" className="register-button">Registrarse</button>
          <p className="register-link">
            <span>¿Ya tienes cuenta?</span> 
            <Link to="/login">Iniciar sesión</Link>
          </p>
        </form>
      </div>
      <div className="right">
        <h2>ÚNETE A NOSOTROS</h2>
        <p>Crea una cuenta para comenzar</p>
      </div>
    </motion.div>
  );
};

export default Register;
