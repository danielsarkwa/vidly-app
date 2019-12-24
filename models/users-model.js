const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 5,
    max: 50
  },
  email: {
    type: String,
    required: true,
    min: 5,
    max: 255,
    unique: true
  },
  password: {
      type: String,
      required: true,
      min: 5,
      max: 1024,
      unique: true
  },
  role: {
    type: String,
    required: true,
    min: 5,
    max: 50
  },
  isAdmin: {
    type: Boolean,
    required: false
  }
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin, role: this.role }, config.get('jwtPrivateKey'));

  return token;
};

const User = mongoose.model('Users', userSchema);

function validateUser(user) {

  const schema = {
    name: Joi.string().min(3).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    role: Joi.string().min(5).max(255).required(),
    isAdmin: Joi.boolean()
  };

  return Joi.validate(user, schema);
};

exports.User = User; 
exports.validate = validateUser;