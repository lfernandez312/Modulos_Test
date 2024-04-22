const express = require('express');
const router = express.Router();
const Product = require('../models/products.model');

router.get('/', async (req, res) => {
  try {
    let products;

    if (req.user.role === 'admin') {
      // Si el usuario es un administrador, se recuperan todos los productos
      products = await Product.find();
    } else if (req.user.role === 'premium') {
      // Si el usuario es premium, se recuperan solo los productos creados por el usuario actual
      products = await Product.find({ owner: req.user.email });
    } else {
      // Otros roles pueden manejar según tu lógica, como mostrar un mensaje de acceso denegado
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    // Filtrar los productos que tienen un estado definido
    const productsWithStatus = products.filter(product => product.status !== undefined);
    
    res.render('listproduct.handlebars', { estilo: 'login.css', products: productsWithStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.render('editproduct.handlebars', { product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    const productData = req.body;
    // Convertir los campos booleanos
    productData.status = Boolean(req.body.status);
    productData.discount = Boolean(req.body.discount);
    productData.availability = Boolean(req.body.availability);
    
    // Actualizar el producto en la base de datos
    const updatedProduct = await Product.findByIdAndUpdate(productId, productData, { new: true });
    res.redirect('/edit/' + productId);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/new', async (req, res) => {
  try {
    const { name, category, description, price, imageUrl, status, discount, availability } = req.body;
    
    // Crea un nuevo producto con los datos recibidos
    const newProduct = new Product({
      name,
      category,
      description,
      price,
      imageUrl,
      status: Boolean(status),
      discount: Boolean(discount),
      availability: Boolean(availability)
    });

    // Guarda el nuevo producto en la base de datos
    await newProduct.save();

    // Redirige a la página de lista de productos con un mensaje de éxito
    res.redirect('/products?success=true');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
