const auth = require('../middleware/auth-middle');
const admin = require('../middleware/admin-middle');
const { User, validate } = require('../models/users-model');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { hashSync } = require('../shared/hash');
const asyncMiddleware = require('../middleware/errorBlock-middle');
const countAdmin = require('../shared/admin-count');
const validateObjectId = require('../middleware/validateObjectId');
const { check_user } = require('../shared/dynamic-checks');

router.get('/me', auth, asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
}));


router.post('/', [auth, admin], asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(404).send(error.details[0].message);
    
    let user = await User.findOne({ email: req.body.email });
    if(user) return res.status(400).send('user already registered');

    user = await new User(_.pick(req.body, ['name', 'email', 'password', 'role', 'isAdmin']));

    user.password = await hashSync(user.password);

    try{
        await user.save();

        const response = {
            message: 'new user created',
            details: _.pick(user, ['_id', 'name', 'email', 'role', 'isAdmin'])
        };
        res.status(200).send(response);
    } catch(ex) {
        throw new Error('could not update user');
    }
}));


router.put('/:id', [auth, admin, validateObjectId], asyncMiddleware(async (req, res) => {
    const { error } = check_user(req.body);
    if (error) return res.status(404).send(error.details[0].message);

    let user = await User.findById(req.params.id);
    if(!user) return res.status(404).send("user with the given ID was not found.");

    const toUpdate = _.pick(req.body, ['name', 'email', 'password', 'role', 'isAdmin']);
    // create a shared function to perform checking of uniqueness of inputs to update
    if(toUpdate.email) {
        let anoEmail = await User.findOne({email: toUpdate['email']});
        if(anoEmail) return res.status(400).send('email already exit');
    }

    const changePassword = (password) => {
        return new Promise(() => {
            user.password = hashSync(password);
        }).catch((err) => console.log('something is baddddd', err.message));
    };

    for(let detail in toUpdate) {
        if(detail === 'password') {
            changePassword(toUpdate[detail]);
        } else {
            user[detail] = toUpdate[detail];
        };
    }

    try{
        await user.save();
        res.status(200).send('user updated successfully');
    } catch(ex) {
        throw new Error('could not update user');
    }
}));


router.delete('/:id', [auth, admin], asyncMiddleware(async (req, res) => {
    let is_admin;
    let proceed = true;
    const userDel = await User.findById(req.params.id);
    if(!userDel) return res.status(404).send("user with the given ID was not found.");

    (userDel.isAdmin && userDel.isAdmin == true) ? is_admin = true : is_admin = false;

    if(is_admin) {
        proceed = await countAdmin();
    };
    
    (proceed === true) ? del() : res.status(405).send("last admin account cannot be deleted");

    async function del() {
        try{
            await User.findByIdAndRemove(req.params.id);
            res.send("user deleted succesfully..");
        }catch(ex) {
            throw new Error('could not delete user');
        }
    };
}));

module.exports = router;