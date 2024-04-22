const { Router } = require('express');
const Users = require('../models/users.model');
const Product = require('../models/products.model');
const passportCall = require('../utils/passport-call.util');
const { customizeError } = require('../services/error.services');
const cartsController = require('./carts.controller');

const router = Router();

router.get('/users', async (req, res) => {
  // Verificar si el usuario tiene un rol válido
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'premium')) {
    const errorMessage = 'No tienes permiso para acceder a esta ruta o debes iniciar sesion';
    return res.status(403).json({ status: 'error', error: errorMessage });
  }

  try {
    const users = await Users.find();

    res.json({
      status: 'success',
      payload: users,
    });
  } catch (error) {
    const errorMessage = customizeError('INTERNAL_SERVER_ERROR');
    res.status(500).json({ status: 'error', error: errorMessage });
  }
});


// Ruta para cambiar el rol de un usuario entre "user" y "premium"
router.put('/users/premium/:uid', async (req, res) => {
  try {
    // Obtiene el ID del usuario a modificar desde los parámetros de la URL
    const userId = req.params.uid;

    // Busca el usuario en la base de datos
    const user = await Users.findById(userId);

    // Verifica si el usuario existe
    if (!user) {
      return res.status(404).json({ status: 'error', error: customizeError('USER_NOT_FOUND') });
    }

    // Cambia el rol del usuario
    user.role = user.role === 'user' ? 'premium' : 'user';

    // Guarda los cambios en la base de datos
    await user.save();

    // Retorna una respuesta exitosa
    res.json({ status: 'success', message: 'User role updated successfully', user });
  } catch (error) {
    // Manejo de errores
    console.error(error);
    res.status(500).json({ status: 'error', error: customizeError('INTERNAL_SERVER_ERROR') });
  }
});

router.post('/cart', async (req, res) => {
  try {
      const { user, products, total } = req.body;
      const newCartInfo = { user, products, total };
      const newCart = await cartsController.createCart(newCartInfo);
      res.json({ payload: newCart });
  } catch (error) {
      const errorMessage = customizeError('ERROR_CART');
      res.status(500).json({ error: errorMessage });
  }
});

router.put('/cart/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const body = req.body;
      await cartsController.updateCart(id, body);
      res.json({ payload: 'Carrito actualizado' });
  } catch (error) {
      const errorMessage = customizeError('ERROR_CART');
      res.status(500).json({ error: errorMessage });
  }
});

router.get('/cart/:id/total', async (req, res) => {
  try {
      const { id } = req.body;
      const totalPrice = await cartsController.getCartTotalPrice(id);
      res.json({ status: 'success', totalPrice });
  } catch (error) {
      const errorMessage = customizeError('ERROR_CART');
      res.status(500).json({ error: errorMessage });
  }
});


router.get('/cart/info',async (req, res) => {
  try {
      const cartInfo = await cartsController.getCartInfo(req);

      // Verifica si cartInfo es null o undefined
      if (!cartInfo || cartInfo.products === null) {
          // El carrito está vacío o no se encontró
          return res.status(404).render('cart.handlebars', { mensaje: 'El carrito está vacío', estilo: 'estilos.css' });
      }

      // Calcular el precio total por producto redondeando a 2 decimales
      cartInfo.products.forEach(product => {
          product.totalPrice = (product.quantity * product.price).toFixed(2);
      });

      // Calcular el totalPrice del carrito redondeando a 2 decimales
      cartInfo.totalPrice = cartInfo.products.reduce((acc, product) => acc + parseFloat(product.totalPrice), 0).toFixed(2);

      // Calcular el totalPrice redondeando a 2 decimales
      const totalPrice = cartInfo.products.reduce((acc, product) => acc + parseFloat(product.price), 0).toFixed(2);

      res.render('cart.handlebars', { cartInfo, totalPrice, estilo: 'estilos.css' });
  } catch (error) {
      const errorMessage = customizeError('ERROR_CART');
      res.status(500).json({ status: 'error', error: errorMessage });
  }
});

router.get('/cart/carrito', async (req, res) => {
  try {
      const carts = await cartsController.getAllCarts();
      res.json({ payload: carts });
  } catch (error) {
      res.status(500).json({ status: 'error', error: errorMessage });
  }
});

router.get('/cart/carrito/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const populatedCart = await cartsController.getCartByIdPopulated(id);
      res.json({ payload: populatedCart });
  } catch (error) {
      const errorMessage = customizeError('ERROR_CART');
      res.status(500).json({ error: errorMessage });
  }
});


router.post('/cart/agregar', async (req, res) => {
  try {
      const productId = req.body.productId;
      const quantity = req.body.quantity; // Si no se proporciona la cantidad, se establece en 1 por defecto
      const user = req.user.email; // Obtengo el usuario actual

      // Lógica para agregar el producto al carrito en controlador
      await cartsController.addToCart(user, productId, quantity);

      res.json({ status: 'success', message: 'Producto agregado al carrito con éxito' });
  } catch (error) {
      if (req.user.role === 'premium' || req.user.role === 'admin') {
          // Si el usuario tiene un rol permitido, devolver el error original
          const errorMessage = customizeError('UNAUTHORIZED_ACCESS');
          return res.status(500).json({ error: errorMessage });
      } else {
          // Si el usuario no tiene el rol adecuado, devolver un mensaje de error estándar
          const errorMessage = customizeError('INVALID_CART');
          return res.status(401).json({ error: errorMessage });
      }
  }
});

// router.get('/session/current', passportCall('jwt'), (req, res) => {
//   try {
//       res.json({ status: 'success', payload: req.headers })
//   } catch (error) {
//       const errorMessage = customizeError('INTERNAL_SERVER_ERROR');
//       res.status(500).json({ error: errorMessage });
//   }
// });

// router.get('/session', (req, res) => {
//   try {
//       res.json({ status: 'success', payload: req.session })
//   } catch (error) {
//       const errorMessage = customizeError('INTERNAL_SERVER_ERROR');
//       res.status(500).json({ error: errorMessage });
//   }
// });
router.get('/products', async (req, res) => {
  try {
    const categories = await Product.distinct('category'); // Obtener todas las categorías disponibles desde la base de datos
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;