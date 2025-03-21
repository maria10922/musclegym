import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Membership from './pages/Membership';
import Programs from './pages/Programs';
import Store from './pages/Store';
import Cart from './pages/Cart';
import RegistrarProgramas from './pages/RegistrarProgramas'; // Importar el nuevo componente
import AddProduct from './pages/Agregar';
import { ProgressProvider } from './pages/ProgressContext';

function App() {
  return (
    <ProgressProvider>
    <Router>
      <Routes>
          <Route path="/agregar" element={<AddProduct />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/store" element={<Store />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/registrar" element={<RegistrarProgramas />} /> {/* Nueva ruta */}
      </Routes>
    </Router>
    </ProgressProvider>
  );
}

export default App;
