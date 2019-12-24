const bcrypt = require('bcrypt');

module.exports.hashSync = function hash(password) {
    const salt = bcrypt.genSaltSync(10);
    hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword;
};
