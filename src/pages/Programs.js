import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useProgress } from './ProgressContext';
import { 
  FaHome, FaInfoCircle, FaDumbbell, FaStore, FaUserPlus,
  FaUser , FaSignInAlt, FaShoppingCart, FaMoon, FaSun,
  FaCheckCircle, FaPlayCircle, FaSpinner, FaTimes, FaPause, FaRedo
} from 'react-icons/fa';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import Modal from 'react-modal';
import axios from 'axios';
import './css/Programs.css';

Modal.setAppElement('#root');

const Programs = () => {
  const { incrementProgress } = useProgress();
  const [navOpen, setNavOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Estado para el temporizador y la ejecución de ejercicios
  const [time, setTime] = useState(0);
  const [timer, setTimer] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [currentSeries, setCurrentSeries] = useState(1);
  const [currentRepetition, setCurrentRepetition] = useState(1);
  
  // Estado para la barra de progreso
  const [progress, setProgress] = useState(0);

  // Fetch programs on mount
  useEffect(() => {
    const fetchPrograms = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:5001/api/programs');
        setPrograms(response.data);
      } catch (error) {
        setError('Error al cargar los programas. Intente nuevamente.');
        console.error('Error al recuperar programas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleProgramClick = (program) => {
    if (selectedProgram?.programa !== program.programa) {
      setSelectedProgram(program);
      fetchExercises(program.programa);
    }
  };

  // Fetch exercises for selected program
  const fetchExercises = async (programaNombre) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5001/api/exercises?programa=${encodeURIComponent(programaNombre)}`);
      setExercises(response.data);
    } catch (error) {
      setError('Error al cargar los ejercicios. Intente nuevamente.');
      console.error("Error al obtener ejercicios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle exercise selection
  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
    setTime(0);
    setCurrentSeries(1);
    setCurrentRepetition(1);
  };

  // Cerrar modales
  const closeModals = () => {
    setSelectedProgram(null);
    setSelectedExercise(null);
    resetTimer();
  };

  // Funciones del temporizador
  const startTimer = () => {
    if (!timerRunning) {
      setTimerRunning(true);
      const newTimer = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
      setTimer(newTimer);
    }
  };

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
      setTimerRunning(false);
    }
  };
  
  const resetTimer = () => {
    stopTimer();
    setTime(0);
    setCurrentSeries(1);
    setCurrentRepetition(1);
  };

  const completeRepetition = () => {
    if (currentRepetition < selectedExercise.repeticiones) {
      setCurrentRepetition(prev => prev + 1);
      setTime(0); // Reiniciar el tiempo para la siguiente repetición
    } else {
      // Si se completan todas las repeticiones, pasar a la siguiente serie
      if (currentSeries < selectedExercise.series) {
        setCurrentSeries(prev => prev + 1);
        setCurrentRepetition(1); // Reiniciar repeticiones para la nueva serie
        setTime(0); // Reiniciar el tiempo para la nueva serie
      } else {
        // Si se completan todas las series, finalizar el ejercicio
        alert("¡Ejercicio completado!");

        // Incrementar el progreso
        incrementProgress();

        closeModals(); // Cerrar el modal
      }
    }
  };

  // Renderizar tarjetas de programas
  const renderProgramCards = () => {
    if (isLoading) return <div className="loading"><FaSpinner className="spinner" /> Cargando programas...</div>;
    if (error) return <div className="error">{error}</div>;
    
    return (
      <div className="programs-grid">
        {programs.map(program => (
          <div 
            key={program.id} 
            className="program-card"
            onClick={() => handleProgramClick(program)}
          >
            <div className="program-header">
              <FaDumbbell className="program-icon" />
              <h3>{program.programa}</h3>
            </div>
            <div className="program-content">
              <p>Creado por: {program.email}</p>
              <button 
                className="view-exercises-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProgramClick(program);
                }}
              >
                Ver Ejercicios <FaPlayCircle />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Renderizar modal de ejercicios
  const renderExerciseModal = () => (
    <Modal
      isOpen={!!selectedProgram}
      onRequestClose={closeModals}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <div className="modal-header">
        <h3>Ejercicios de {selectedProgram?.programa}</h3>
        <button onClick={closeModals} className="close-btn">
          <FaTimes />
        </button>
      </div>
      <div className="exercises-list">
        {exercises.map(exercise => (
          <div 
            key={exercise.id} 
            className="exercise-item"
            onClick={() => handleExerciseClick(exercise)}
          >
            <h4>{exercise.ejercicio}</h4>
            <p>{exercise.series} series de {exercise.repeticiones} repeticiones</p>
            <button className="start-exercise-btn">
              Comenzar <FaPlayCircle />
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );

  // Renderizar modal de ejecución de ejercicio
  const renderExerciseExecutionModal = () => (
    <Modal
      isOpen={!!selectedExercise}
      onRequestClose={closeModals}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <div className="modal-header">
        <h3>Ejecutando: {selectedExercise?.ejercicio}</h3>
        {/* Aquí movemos el botón dentro del modal-header */}
        <button onClick={closeModals} className="close-btn">
          <FaTimes />
        </button>
      </div>
  
      <div className="exercise-execution">
        <p>⏱️ Tiempo: {time}s</p>
        <p>📌 Serie {currentSeries} de {selectedExercise?.series}</p>
        <p>💪 Repetición {currentRepetition} de {selectedExercise?.repeticiones}</p>
  
        {/* Barra de Progreso */}
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
        <p>{progress.toFixed(0)}% Completado</p>
  
        <div className="exercise-controls">
          <button onClick={startTimer}><FaPlayCircle /> Iniciar</button>
          <button onClick={stopTimer}><FaPause /> Pausar</button>
          <button onClick={resetTimer}><FaRedo /> Reiniciar</button>
          <button onClick={completeRepetition}><FaCheckCircle /> Completar Repetición</button>
        </div>
      </div>
    </Modal>
  );
  

  // Limpiar el temporizador al desmontar el componente
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  return (
    <div className={`program-container ${navOpen ? "nav-open" : ""}`}>
      
      <div className={`sidebar ${navOpen ? "open" : ""}`}>
        <button className="menu" onClick={() => setNavOpen(!navOpen)}>
          <img src="/imagenes/logo.png" alt="Logo" className="logo" />
        </button>

        <button className="theme-toggle" onClick={() => {
          const newTheme = theme === "light" ? "dark" : "light";
          setTheme(newTheme);
          localStorage.setItem("theme", newTheme);
          document.documentElement.setAttribute("data-theme", newTheme);
        }}>
          {theme === "light" ? <FaMoon /> : <FaSun />}
          {navOpen && <span>{theme === "light" ? "Modo Oscuro" : "Modo Claro"}</span>}
        </button>

        <nav>
          {[
            { path: "/dashboard", icon: <FaHome />, name: "Inicio" },
            { path: "/about", icon: <FaInfoCircle />, name: "Acerca de" },
            { path: "/programs", icon: <FaDumbbell />, name: "Programas" },
            { path: "/store", icon: <FaStore />, name: "Tienda" },
            { path: "/membership", icon: <FaUserPlus />, name: "Membresía" },
            { path: "/profile", icon: <FaUser  />, name: "Perfil" },
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

      <div className={`page ${navOpen ? "nav-open" : ""}`}>
        <h3>Programas Disponibles</h3>
        {renderProgramCards()}
      </div>

      {renderExerciseModal()}
      {renderExerciseExecutionModal()}

      <footer className="footer2">
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

export default Programs;