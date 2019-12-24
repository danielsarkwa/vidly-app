const express = require('express');
const genres = require('../routes/genres'),
      customers = require('../routes/customers'),
      movies = require("../routes/movies"),
      rentals = require('../routes/rentals'),
      returns = require('../routes/returns');
const users = require('../routes/users'),
      auth = require('../routes/auth');
const error = require('../shared/error');

module.exports = function(app) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/api/genres', genres);
    app.use('/api/customers', customers);
    app.use('/api/movies', movies);
    app.use('/api/rentals', rentals);
    app.use('/api/returns', returns);
    app.use('/api/users', users);
    app.use('/api/auth', auth);
    app.use(error);
};