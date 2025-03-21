import api from './api';

export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

// Otras funciones relacionadas con productos pueden ser añadidas aquí
