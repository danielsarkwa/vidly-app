const Joi = require('joi');

module.exports.check_user = function (user) {
  const schema = {
    name: Joi.string().min(3),
    email: Joi.string().min(5).max(255).email(),
    password: Joi.string().min(5).max(255),
    role: Joi.string().min(5).max(255),
    isAdmin: Joi.boolean()
  };
  return Joi.validate(user, schema);
};

module.exports.check_movie = function (movie) {
  const schema = {
    title: Joi.string().min(5).max(50),
    genreId: Joi.objectId(),
    numberInStock: Joi.number().min(0),
    dailyRentalRate: Joi.number().min(0)
  };
  return Joi.validate(movie, schema);
};

module.exports.check_customer = function (customer) {
  const schema = {
    name: Joi.string().min(5).max(50),
    phone: Joi.string().min(5).max(50),
    isGold: Joi.boolean()
  };
  return Joi.validate(customer, schema);
};

module.exports.check_rental = function (rental) {
  const schema = {
    customerId: Joi.objectId(),
    movieId: Joi.objectId()
  };
  return Joi.validate(rental, schema);
};