var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var config = require('../config/server.js');

// load up the user model
var User = require('../models/user');

// load the auth variables
var configAuth = require('./auth');

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });


    passport.use(new GoogleStrategy({
        clientID: '60245096456-i1hsjrpk30uilu9h16ine1p2k9em9fjk.apps.googleusercontent.com',
        clientSecret: 'WslJ9zeGDLd1Wy9HCUfWk1Wc',
        callbackURL: config.hostUrl + '/auth/google/callback',
    },
        function(accessToken, refreshToken, profile, cb) {

            User.findOne({ 'google.id': profile.id }, function(err, user) {
                if (err) {
                    return cb(err, null);
                }

                if (!user) {

                    user = new User();

                    user.google = {
                        id: profile.id,
                    };
                    
                    user.meta = {
                        created: Date.now(),
                        logged: Date.now(),
                    };

                    user.data = {
                        settings: {},
                    };
                    
                    console.log('User not found! New user created...');

                }
                
                user.google.email = profile.emails[0].value;
                user.google.name = profile.name.givenName + ' ' + profile.name.familyName;
                user.google.image = profile.photos[0].value;

                user.meta.logged = Date.now();
                
                console.log('User data updated!');

                user.save(function(saveErr) {
                    if (saveErr) {
                        return cb(saveErr, null);
                    }
                    
                    return cb(err, user);
                });
            });
        }
    ));

}