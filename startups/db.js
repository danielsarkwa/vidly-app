const mongoose = require("mongoose");
const config = require("config");

module.exports = function() {
    const db = config.get("db");
    mongoose.Promise = global.Promise;
    mongoose.connect(db, { useNewUrlParser: true })
            .then(() => console.log(`vidly app connected to ${db}...`));
};
