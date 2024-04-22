const { Router } = require('express');
const Users = require('../models/users.model');
const passport = require('passport');
const usersService = require('../services/users.services');
const NewUserDto = require('../DTO/new-users.dto');
const router = Router();

router.post('/', passport.authenticate('register', { failureRedirect: '/users/fail-register' }), async (req, res) => {
  try {

    const newUserInfo = new NewUserDto(req.body);
    const newUser = await usersService.create(newUserInfo)

    res.status(201).json({ status: 'success', message: 'User has been registered'});
  } catch (error) {
    const errorMessage = customizeError('INTERNAL_SERVER_ERROR');
    res.status(500).json({status: 'error', error: errorMessage });
  }
});

router.get('/fail-register', (req, res) => {
    const errorMessage = customizeError('BAD_REQUEST');
    res.status(500).json({status: 'error', error: errorMessage });
});

module.exports = router;