const { User } = require('../models/users-model');

module.exports = async function() {
    const users = await User.find({});
    let counter = 0;
    users.forEach(user => {
        if(user.isAdmin && user.isAdmin == true) {
            ++counter;
        }
    });

    let can_delete = false;
    if(counter >= 2) {
        can_delete = true;
    };

    return can_delete;
}