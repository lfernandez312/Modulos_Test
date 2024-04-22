const supertest = require('supertest');
const { expect } = require('chai');
const express = require('express');
const app = express();

describe('Product Router', () => {
  it('POST /products/new should create a new product', async () => {
    const newProductData = {
      name: 'New Product',
      category: 'New Category',
      description: 'New Description',
      price: 49.99,
      imageUrl: '',
      status: true,
      discount: false,
      availability: true
    };

    const response = await supertest(app)
      .post('/products/new')
      .send(newProductData)
  });

  it('POST /products/:id should update a product', async () => {
    const productId = '66156ed26f61c31db514f576'; //ID DE PRUEBA DESDE MI MONGO
    const updatedProductData = {
      name: 'Updated Product Name',
      category: 'Updated Category',
      description: 'Updated Description',
      price: 99.99,
      imageUrl: '',
      status: true,
      discount: false,
      availability: true
    };

    const response = await supertest(app)
      .post(`/products/${productId}`)
      .send(updatedProductData)
  });

  it('POST /products/remove/:id should remove a product', async () => {
    const productId = '66156ed26f61c31db514f576'; //ID DE PRUEBA DESDE MI MONGO
    const response = await supertest(app)
      .post(`/products/remove/${productId}`)
  });
});

describe('Cart Router', () => {
  it('GET /carts/info should return cart information', async () => {
    const response = await supertest(app)
      .get('/carts/info')
  });

  it('POST /carts/agregar should add a product to the cart', async () => {
    const productId = '6615732cd813f7ab607516c1';
    const response = await supertest(app)
      .post('/carts/agregar')
      .send({ productId: productId, quantity: 1 }) 
  });

  it('DELETE /carts/remove/:productId should remove a product from the cart', async () => {
    const productId = '6615732cd813f7ab607516c1'; 
    const response = await supertest(app)
      .delete(`/carts/remove/${productId}`)
  });
  
});

describe('Session Router', () => {
  it('POST /sessions/login should log in a user', async () => {
    const userData = {
      email: 'user@example.com', // Reemplazar con un correo electrónico válido de un usuario existente
      password: 'password123' // Reemplaza 'password123' con la contraseña correspondiente
    };
    const response = await supertest(app)
      .post('/sessions/login')
      .send(userData)
  });

  it('GET /sessions/logout should log out a user', async () => {
    const response = await supertest(app)
      .get('/sessions/logout')
  });

  it('GET /sessions/user should get user information', async () => {
    const response = await supertest(app)
      .get('/sessions/user')
  });
});