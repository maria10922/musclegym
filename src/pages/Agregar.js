import React, { useState } from 'react';
import axios from 'axios';
import './css/AddProduct.css';

const AddProduct = () => {
  const [product, setProduct] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    imagen: null
  });

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProduct({ ...product, imagen: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('nombre', product.nombre);
    formData.append('descripcion', product.descripcion);
    formData.append('precio', product.precio);
    formData.append('stock', product.stock);
    if (product.imagen) {
      formData.append('imagen', product.imagen);
    }

    try {
      await axios.post('http://localhost:5001/api/productos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Producto agregado exitosamente');
      setProduct({ nombre: '', descripcion: '', precio: '', stock: '', imagen: null });
    } catch (error) {
      console.error('Error al agregar producto', error);
      alert('Error al agregar el producto');
    }
  };

  return (
    <div className="add-product">
      <h2>Agregar Producto</h2>
      <form onSubmit={handleSubmit}>
        <label>Nombre:</label>
        <input type="text" name="nombre" value={product.nombre} onChange={handleChange} required />
        
        <label>Descripción:</label>
        <textarea name="descripcion" value={product.descripcion} onChange={handleChange} required></textarea>

        <label>Precio:</label>
        <input type="number" name="precio" value={product.precio} onChange={handleChange} required />

        <label>Stock:</label>
        <input type="number" name="stock" value={product.stock} onChange={handleChange} required />

        <label>Imagen:</label>
        <input type="file" onChange={handleFileChange} />

        <button type="submit">Agregar Producto</button>
      </form>
    </div>
  );
};

export default AddProduct;
