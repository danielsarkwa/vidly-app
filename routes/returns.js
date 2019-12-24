const express = require('express');
const router = express.Router();
const Joi = require('joi');
const auth = require('../middleware/auth-middle');
const asyncMiddleware = require('../middleware/errorBlock-middle');
const { Rental } = require('../models/rentals-model');
const { Movie } = require('../models/movies-model');
const validate = require('../middleware/validate-input');

router.post('/', [auth, validate(validateReturn)], asyncMiddleware(async (req, res) => {
    const id_rental = req.body.rental_id;

    const rental = await Rental.findById(id_rental);
    if(!rental) return res.status(404).send('Rental no found');

    if(rental.returned) return res.status(400).send('Return already processed');
    
    rental.return();
    await rental.save();

    await Movie.update({ _id: rental.movie._id }, {
        $inc: { numberInStock: +1 }
    });

    res.status(200).send("return processed successfully");
}));

function validateReturn(req) {
    const schema = {
      rental_id: Joi.objectId().required()
    };
    return Joi.validate(req, schema);
}

module.exports = router;