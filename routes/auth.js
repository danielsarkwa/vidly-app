const { User } = require('../models/users-model');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const _ = require('lodash');
const Joi = require('joi');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
    const { error } = validate(req.body); 
    if (error) return res.status(404).send(error.details[0].message);
    
    let user = await User.findOne({ email: req.body.email });
    if(!user) return res.status(400).send('invalid email or password');

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).send('invalid email or password');
    
    const token = user.generateAuthToken();
    
    res.header('x-auth-token', token)
       .status(200).send("logged in");
});

function validate(req) {
    const schema = {
      email: Joi.string().min(5).max(255).required().email(),
      password: Joi.string().min(5).max(255).required()
    };
  
    return Joi.validate(req, schema);
  };

module.exports = router;