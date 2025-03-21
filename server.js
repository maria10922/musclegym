const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());
const SECRET_KEY = 'mi_secreto_super_seguro';

const uploadDir = './uploads/';
app.use("/uploads", express.static("uploads"));

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    return mimetype && extname ? cb(null, true) : cb(new Error('Solo imágenes JPEG, JPG, PNG o GIF.'));
  },
});

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'my_app_db',
});

db.connect((err) => {
  if (err) return console.error('Error al conectar con MySQL:', err);
  console.log('Conectado a la base de datos!');
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: 'soportet508@gmail.com', pass: 'upovubnxfskxdcax' },
});

const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado, token requerido' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.user = user; // Guarda los datos decodificados del usuario
    next();
  });
}



app.post('/api/register', upload.single('profilePicture'), async (req, res) => {
  const { name, email, password, weight, height } = req.body;
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !email || !password || !weight || !height) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const [existingUser] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Este correo ya está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (name, email, password, weight, height, profile_picture) VALUES (?, ?, ?, ?, ?, ?)';
    await db.promise().query(query, [name, email, hashedPassword, weight, height, profilePicture]);

    const mailOptions = {
      from: 'soportet508@gmail.com',
      to: email,
      subject: 'Confirmación de Registro',
      html: `<h2>Bienvenido, ${name}!</h2><p>Tu registro ha sido exitoso.</p>`
    };

    transporter.sendMail(mailOptions);
    res.status(201).json({ message: 'Registro exitoso y correo enviado!' });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar. Inténtalo de nuevo.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  try {
    const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ message: 'Inicio de sesión exitoso!', token, user });
  } catch (error) {
    console.error('Error al iniciar sesión:', error); // Imprimir el error completo
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});
app.get('/api/comments', async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM comments ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
});


app.post('/api/comments', authenticateToken, async (req, res) => {
  const { name, comment } = req.body;
  if (!name || !comment) {
    return res.status(400).json({ error: 'Nombre y comentario son requeridos.' });
  }
  try {
    await db.promise().query('INSERT INTO comments (name, comment) VALUES (?, ?)', [name, comment]);
    res.status(201).json({ message: 'Comentario enviado exitosamente!' });
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar comentario' });
  }
});
app.post('/api/register-program', (req, res) => {
  const { program, name, email } = req.body;

  if (!program || !name || !email) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const sql = 'INSERT INTO registros (name, email, programa) VALUES (?, ?, ?)';
  db.query(sql, [name, email, program], (err, result) => {
    if (err) {
      console.error('Error al insertar datos:', err);
      return res.status(500).json({ error: 'Error al registrar' });
    }

    // Configurar opciones del correo de confirmación
    const mailOptions = {
      from: 'soportet508@gmail.com',
      to: email,
      subject: 'Confirmación de Registro en Programa',
      html: `<h2>Hola, ${name}!</h2><p>Te has registrado exitosamente en el programa: <b>${program}</b>.</p><p>Gracias por participar.</p>`
    };

    // Enviar el correo de confirmación
    transporter.sendMail(mailOptions, (mailErr, info) => {
      if (mailErr) {
        console.error('Error al enviar correo:', mailErr);
        return res.status(500).json({ error: 'Registro exitoso, pero error al enviar el correo' });
      }
      console.log('Correo enviado:', info.response);
      res.json({ message: 'Registro exitoso y correo enviado', name, email, program });
    });
  });
});


// Ruta para obtener los registros de usuarios con sus programas
app.get('/api/programs', (req, res) => {
  const sql = 'SELECT * FROM registros';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener datos:', err);
      return res.status(500).json({ error: 'Error al obtener registros' });
    }
    res.json(results);
  });
});
// Ruta para obtener ejercicios según el programa
app.get('/api/exercises', (req, res) => {
  const { programa } = req.query;

  if (!programa) {
    return res.status(400).json({ error: 'Falta el parámetro programa' });
  }

  const sql = 'SELECT * FROM exercises WHERE programa = ?';

  db.query(sql, [programa], (err, results) => {
    if (err) {
      console.error('Error al obtener ejercicios:', err);
      return res.status(500).json({ error: 'Error al obtener ejercicios' });
    }

    res.json(results);
  });
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;  

    const [rows] = await db.promise().query(
      `SELECT 
          u.id, u.name, u.email, 
          CONCAT('http://localhost:5001', u.profile_picture) AS profile_picture, 
          r.programa  
       FROM users u
       LEFT JOIN registros r ON u.name = r.name  
       WHERE u.id = ?`, 
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json(rows[0]);  
  } catch (error) {
    console.error('Error en la API de perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// Ruta para procesar el pago de membresía
app.post('/api/pay-membership', async (req, res) => {
  const { email, membershipName } = req.body; // Recibir correo y nombre de la membresía

  try {
    // Guardar la información en la base de datos
    const query = 'INSERT INTO membership_payments (email, membership_name, registration_date) VALUES (?, ?, NOW())';
    await db.promise().query(query, [email, membershipName]);

    // Enviar correo de confirmación
    const mailOptions = {
      from: 'tu-email@example.com',
      to: email,
      subject: 'Confirmación de Pago',
      text: `Tu pago para la membresía ${membershipName} ha sido procesado con éxito.`,
    };

    transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Pago procesado con éxito' });
  } catch (error) {
    console.error('Error al procesar el pago:', error);
    res.status(500).json({ error: 'Error al procesar el pago' });
  }
});
app.get("/api/productos", (req, res) => {
  const sql = "SELECT * FROM productos";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener productos:", err);
      return res.status(500).json({ error: "Error al obtener productos" });
    }

    // Asegurar que la URL de la imagen es completa
    const productosConImagen = results.map(producto => ({
      ...producto,
      imagen: producto.imagen ? `http://localhost:5001${producto.imagen}` : null
    }));

    res.json(productosConImagen);
  });
});

// 📌 Ruta para agregar un producto (POST)
app.post("/api/productos", upload.single("uploads"), (req, res) => {
  const { nombre, descripcion, precio, stock } = req.body;
  const imagen = req.file ? req.file.filename : null;

  if (!nombre || !descripcion || !precio || !stock) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const sql = "INSERT INTO productos (nombre, descripcion, precio, stock, imagen) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [nombre, descripcion, precio, stock, imagen], (err, result) => {
    if (err) {
      console.error("Error al agregar producto:", err);
      return res.status(500).json({ error: "Error al agregar producto" });
    }
    res.json({ message: "Producto agregado exitosamente", id: result.insertId });
  });
});
// 📌 **Enviar factura por correo**
const sendInvoice = async (email, cartItems, total) => {
  const itemsList = cartItems
    .map(
      (item) => `<li>${item.cantidad} x ${item.nombre} - $${item.total.toFixed(2)}</li>`
    )
    .join("");

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Factura de tu compra",
    html: `<h3>Gracias por tu compra</h3>
           <p>Detalles de tu compra:</p>
           <ul>${itemsList}</ul>
           <p><strong>Total: $${total.toFixed(2)}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📩 Factura enviada a", email);
  } catch (error) {
    console.error("❌ Error enviando el correo:", error);
  }
};

// 📌 **Comprar un solo producto**
app.post("/api/comprar", async (req, res) => {
  const { productId, cantidad, precio, total, email } = req.body;

  if (!productId || !cantidad || !precio || !email) {
    return res.status(400).json({ error: "Faltan datos en la solicitud" });
  }

  try {
    const [results] = await db.promise().query("SELECT stock FROM productos WHERE id = ?", [productId]);
    if (results.length === 0 || results[0].stock < cantidad) {
      return res.status(400).json({ error: "Stock insuficiente" });
    }

    await db.promise().query("UPDATE productos SET stock = stock - ? WHERE id = ?", [cantidad, productId]);
    await sendInvoice(email, [{ productId, cantidad, total }], total);

    res.json({ message: "✅ Compra realizada. Factura enviada." });
  } catch (error) {
    console.error("❌ Error en la compra:", error);
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

// 📌 **Comprar todos los productos del carrito**
app.post("/api/comprar-todo", async (req, res) => {
  const { cart, email } = req.body;

  if (!cart || cart.length === 0 || !email) {
    return res.status(400).json({ error: "El carrito está vacío o faltan datos" });
  }

  let totalCompra = 0;
  const connection = db.promise();

  try {
    for (let item of cart) {
      totalCompra += item.total;

      const [stockResult] = await connection.query("SELECT stock FROM productos WHERE id = ?", [item.productId]);
      if (!stockResult.length || stockResult[0].stock < item.cantidad) {
        return res.status(400).json({ error: `Stock insuficiente para ${item.productId}` });
      }

      await connection.query("UPDATE productos SET stock = stock - ? WHERE id = ?", [item.cantidad, item.productId]);
    }

    await sendInvoice(email, cart, totalCompra);
    res.json({ message: "✅ Compra completada. Factura enviada." });
  } catch (error) {
    console.error("❌ Error en la compra:", error);
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
