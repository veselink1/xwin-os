var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var userSchema = mongoose.Schema({

    google: {
        id: String,
        email: String,
        name: String,
        image: String,
        accessToken: String,
        refreshToken: String,
    },
    meta: {
        created: Date,
        logged: Date,
    },
    data: Object,

});

userSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', userSchema);