const winston = require('winston');

module.exports = function(err, req, res, next) {
    console.log(err.message, err);

    res.status(500).send("something failed");
};






// exceptions error
/**
 * error
 * warn
 * info
 * verbose
 * debug
 * silly
 */