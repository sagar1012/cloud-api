const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        require: true
    },
    userName: {
        type: String,
        unique: true,
        require: true
    },
    password: {
        type: String,
        require: true,
    },
    firstName: {
        type: String,
        require: true,
    },
    lastName: {
        type: String,
    },
    token: {
        type: String,
    }
});

module.exports = mongoose.model('User', userSchema);