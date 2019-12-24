const auth = require('../middleware/auth-middle');
const { Genre, validate } = require('../models/genres-model');
const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middleware/errorBlock-middle');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/', auth, asyncMiddleware(async (req, res) => {
    const genres = await Genre.find().sort('name');
    res.send(genres);
}));


router.get('/:id', auth, validateObjectId, asyncMiddleware(async (req, res) => {

  const genre = await Genre.findById(req.params.id);

  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  res.send(genre);
}));


router.post('/', auth, asyncMiddleware(async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let genre = await Genre.findOne({name: req.body.name});
  if(genre) return res.status(400).send('genre already exit');

  genre = new Genre({ 
    name: req.body.name 
  });

  try{
    await genre.save();
    
    const response = {
      message: "new genre added successfully",
      genre: genre
    };
    res.send(response);
  } catch(ex) {
      throw new Error('could not add genre');
  };
}));


router.put('/:id', auth, validateObjectId, asyncMiddleware(async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let genre = await Genre.findById({_id: req.params.id});
  if(!genre) return res.status(404).send('The genre with the given ID was not found.');
  
  const anoGenre = await Genre.findOne({name: req.body.name});
  if(anoGenre) return res.status(400).send('genre name already exit');

  try{
    genre.name = req.body.name;
    
    await genre.save();
    const response = {
      message: "genre upated successfully",
      genre: genre
    };
    res.send(response);
  } catch(ex) {
      throw new Error('could not update genre');
  };
}));


router.delete('/:id', auth, validateObjectId, asyncMiddleware(async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);
  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  res.send("genre deleted sunccesfully..");
}));


module.exports = router;