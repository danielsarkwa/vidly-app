const mongoose = require("mongoose"),
      express = require("express"),
      router = express.Router(),
      { Movie } = require("../models/movies-model"),
      { Rental, validate } = require("../models/rentals-model"),
      { Customer } = require("../models/customer-model"),
      Fawn = require("fawn"),
      _ = require("lodash"),
      asyncMiddleware = require('../middleware/errorBlock-middle'),
      validateObjectId = require('../middleware/validateObjectId'),
      { check_rental } = require('../shared/dynamic-checks');

const auth = require('../middleware/auth-middle'),
      admin = require('../middleware/admin-middle');

Fawn.init(mongoose);

router.get('/', auth, asyncMiddleware(async (req, res) => {
  const rentals = await Rental.find().sort('-dateOut');
  res.send(rentals);
}));


router.get('/:id', [auth, validateObjectId], asyncMiddleware(async (req, res) => {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).send('The rental with the given ID was not found.');
    res.send(rental);
}));


router.post('/', auth, asyncMiddleware(async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
  
  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send('Invalid customer.');

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send('Invalid movie.');

  let rental = await Rental.findOne({customer: customer, movie: movie});
  if(rental) return res.status(400).send('rental already exit');

  if (movie.numberInStock === 0) return res.status(400).send('Movie out of stock.');

  rental = new Rental({
    customer: {
          _id: customer._id,
          name: customer.name, 
          phone: customer.phone,
          isGold: customer.isGold
        },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate
    }
  });
 
  try {
    new Fawn.Task()
            .save("rentals", rental)
            .update("movies", { _id: movie._id }, {
               $inc: { numberInStock: -1 }
             })
            .run();

            const response = {
              message: "rental added successfully",
              rental: rental
            };
            res.send(response);
  } catch(err) {
      throw new Error('could not add new rental')
  };
}));


router.put("/:id", auth, validateObjectId, asyncMiddleware(async (req,res) => {
    const { error } = check_rental(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let oldMovie;
    let movie;

    let rental = await Rental.findById(req.params.id);
    if(!rental) return res.status(404).send("invalid rental...");

    const toUpdate = _.pick(req.body, ['customerId', 'movieId']);

    if(toUpdate.customerId) {
      let customer = await Customer.findById(toUpdate.customerId);
      if (!customer) return res.status(400).send('Invalid customer.');

      rental.customer = customer
    };

    if(toUpdate.movieId) {
      oldMovie = await Movie.findById(rental.movie._id);
      movie = await Movie.findById(req.body.movieId);
      if (!movie) return res.status(400).send('Invalid movie.');
      if (movie.numberInStock === 0) return res.status(400).send('Movie out of stock.');

      rental.movie = movie;
      oldMovie.numberInStock = ++oldMovie.numberInStock;
      movie.numberInStock = --movie.numberInStock;

      console.log('old movie stock', oldMovie.numberInStock);
      console.log('new movie stock', movie.numberInStock);
    };

    let anoRental = await Rental.findOne({customer: rental.customer, movie: rental.movie});
    if(anoRental) return res.status(400).send('rental already exit');
    
    try {
      await rental.save();
      await oldMovie.save();
      await movie.save();
    
      const response = {
        message: "rental updated successfully",
        rental: rental
      };
      res.send(response);
    } catch(err) {
      res.status(500).send("could not update rental");
    };
}));


router.delete("/:id", auth, validateObjectId, asyncMiddleware(async (req, res) => {
    const rental = await Rental.findByIdAndRemove(req.params.id);
    if(!rental) return res.status(404).send("invalid rental id");

    const movieId = rental.movie._id;
    try {
      new Fawn.Task()
              .update("movies", {_id: movieId}, {
                $inc: {numberInStock: +1}
              })
              .run();

      res.send(`rental have been deleted succesfully`);
    } catch(err) {
      console.log("an error occured", err);
    };
}));

module.exports = router;