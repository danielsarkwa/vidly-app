const auth = require('../middleware/auth-middle');
const { Movie, validate } = require('../models/movies-model'); 
const { Genre } = require('../models/genres-model');
const _ = require('lodash');
const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middleware/errorBlock-middle');
const validateObjectId = require('../middleware/validateObjectId');
const { check_movie } = require('../shared/dynamic-checks');


router.get('/', auth, asyncMiddleware(async (req, res) => {
    const movies = await Movie.find().sort('name');
    res.send(movies);
}));


router.get('/:id', [auth, validateObjectId], asyncMiddleware(async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    if(!movie) return res.send(404).send('The movie with the given ID was not found.')

    res.send(movie);
}));


router.post('/', auth, asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    let movie = await Movie.findOne({title: req.body.title});
    if(movie) return res.status(400).send('movie already exit');

    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(400).send('Invalid genre.');

    movie = new Movie({ 
        title: req.body.title,
        genre: {
          _id: genre._id,
          name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });

    try {
        await movie.save();

        const response = {
            message: "movie added successfully",
            movie: movie
        };
        res.send(response);
    } catch(ex) {
        throw new Error('could not add movie');
    }
}));


router.put('/:id', [auth, validateObjectId], asyncMiddleware(async (req, res) => {
    const { error } = check_movie(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    let movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send('The movie with the given ID was not found.');
    
    const toUpdate = _.pick(req.body, ['title', 'genreId', 'numberInStock', 'dailyRentalRate']);
    let genre;

    if(toUpdate.genreId) {
        genre = await Genre.findById(toUpdate['genreId']);
        if (!genre) return res.status(400).send('Invalid genre.');
    }

    if(toUpdate.title) {
        const anoMovie = await Movie.findOne({title: toUpdate['title']});
        if(anoMovie) return res.status(400).send('genre title already exit');
    }

    for (let item in toUpdate) {
        if (item == 'genreId') {
            movie.genre = genre;
        } else {
            movie[item] = toUpdate[item];
        }
    }

    try {
        await movie.save();
        res.send("movie updated successfully"); 
    } catch(ex) {
        throw new Error('could not update movie');
    }

}));

router.delete('/:id', auth, validateObjectId, asyncMiddleware(async (req, res) => {    
    const movie = await Movie.findByIdAndRemove(req.params.id);
    if (!movie) return res.status(404).send('The movie with the given ID was not found.');

    const message = `${movie.title} deleted successfully`;
    res.send(message);
}));

module.exports = router;