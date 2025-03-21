import axios from 'axios';

// Crear una instancia de Axios
const api = axios.create({
  baseURL: 'http://localhost:5001/', // Verifica que este sea el puerto correcto
  timeout: 10000, // Aumentar timeout si es necesario
});

// Interceptor para agregar el token a las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Obtener el token del localStorage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Agregar token al header
    }
    return config;
  },
  (error) => {
    console.error("Error en la solicitud:", error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error globalmente
api.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa, devolverla
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      console.error("Error en la respuesta:", data);
      console.error("Código de estado:", status);

      if (status === 401) {
        console.warn("Token inválido o expirado. Redirigiendo al login...");
        localStorage.removeItem('token');

        // En lugar de `window.location.href`, usa `window.location.replace`
        if (window.location.pathname !== '/login') {
          window.location.replace('/login'); // Evita que el usuario use "atrás" en el navegador
        }
      } else if (status === 500) {
        console.error("Error interno del servidor. Intenta más tarde.");
      } else if (status === 404) {
        console.error("Recurso no encontrado.");
      }
    } else if (error.request) {
      console.error("No se recibió respuesta del servidor:", error.request);
    } else {
      console.error("Error en la configuración de la solicitud:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
