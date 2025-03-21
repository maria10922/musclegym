import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './css/RegistrarProgramas.css';

const RegistrarProgramas = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const program = queryParams.get('programa'); // Obtener el nombre del programa desde la URL

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      console.log("Enviando:", { program, name, email });

      // Check for existing registration first
      try {
        const checkResponse = await axios.get(`http://localhost:5001/api/programs`);
        const existingRegistration = checkResponse.data.find(
          reg => reg.email === email && reg.programa === program
        );
        
        if (existingRegistration) {
          throw new Error('Ya estás registrado en este programa.');
        }
      } catch (error) {
        console.error('Error verificando registro existente:', error);
        // Continue with registration if check fails
      }


      const response = await axios.post('http://localhost:5001/api/register-program', {
        program: program,
        name: name,
        email: email,
        date: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });




      if (response.status === 200 || response.status === 201) {
        console.log('Registro exitoso:', response.data);
        setRegistroExitoso(true);
        setName('');
        setEmail('');
      }

    } catch (error) {
      console.error('Error al registrar:', error);
      if (error.message === 'Ya estás registrado en este programa.') {
        setErrorMessage(error.message);
      } else if (error.response) {
        if (error.response.status === 400) {
          setErrorMessage('Datos inválidos: ' + 
            (error.response.data?.errors?.join(', ') || 
            'Por favor verifique la información ingresada.'));
        } else {
          setErrorMessage(
            error.response.data?.message || 
            'Error al registrar. Por favor intente nuevamente.'
          );
        }
      } else {
        setErrorMessage('Error de conexión. Verifique su conexión a internet.');
      }




    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div>
      <h1>Registro para el Programa: {program}</h1>

      {registroExitoso ? (
        <div>
          <h2>¡Registro Exitoso!</h2>
          <p>Nombre: {name}</p>
          <p>Email: {email}</p>
          <p>Programa: {program}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nombre:</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label>Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Registrar'}
          </button>
          {errorMessage && <div className="error-message">{errorMessage}</div>}

        </form>
      )}
    </div>
  );
};

export default RegistrarProgramas;
