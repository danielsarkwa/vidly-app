const auth = require('../middleware/auth-middle');
const { Customer, validate } = require('../models/customer-model');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const asyncMiddleware = require('../middleware/errorBlock-middle');
const validateObjectId = require('../middleware/validateObjectId');
const { check_customer } = require('../shared/dynamic-checks');


router.get('/', auth, asyncMiddleware(async (req, res) => {
  const customers = await Customer.find().sort('name');
  res.send(customers);
}));


router.get('/:id', auth, validateObjectId, asyncMiddleware(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) return res.status(404).send('The customer with the given ID was not found.');

  res.send(customer);
}));


router.post('/', auth, asyncMiddleware(async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let customer = await Customer.findOne({phone: req.body.phone});
  if(customer) return res.status(400).send('customer already exit');

  customer = new Customer({
    name: req.body.name,
    isGold: req.body.isGold,
    phone: req.body.phone
  });

  try {
    await customer.save();
    res.send(customer);
  } catch(ex) {
    throw new Error('could not add customer')
  }
}));


router.put('/:id', [auth, validateObjectId], asyncMiddleware(async (req, res) => {
  const { error } = check_customer(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).send('The customer with the given ID was not found.');

  toUpdate = _.pick(req.body, ['name', 'isGold', 'phone']);

  if(toUpdate.phone) {
    const anoCustomer = await Customer.findOne({phone: toUpdate['phone']});
    if (anoCustomer) return res.status(400).send('phone already exit');
  }
  
  for(let item in toUpdate) {
    if(item == 'phone') {
      customer[item] = toUpdate[item];
    } else {
      customer[item] = toUpdate[item];
    }
  }

  try {
    await customer.save();
    res.send('customer updated succesfully')
  } catch(ex) {
    throw new Error('could not update customer details');
  }
}));


router.delete('/:id', auth, validateObjectId, asyncMiddleware(async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);
  if (!customer) return res.status(404).send('The customer with the given ID was not found.');

  const message = 'customer removed successfully'; 
  res.send(message);
}));

module.exports = router; 