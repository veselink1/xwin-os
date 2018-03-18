var express = require('express');
var passport = require('passport');
var passportConfig = require('../config/passport.js')(passport);
var _ = require('lodash');
var router = express.Router();

router.use('/api', require('./api'));

router.get('/', function(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/desktop');
    } else {
        res.redirect('/login');
    }
});

router.get('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
});

router.get('/login', function(req, res, next) {
    res.render('login.ejs', {});
});

router.get('/desktop', function(req, res) {
    // if (req.isAuthenticated()) {
        res.render('desktop.ejs', {
            user: JSON.stringify(req.user || { error: 'User must be authenticated!' }),
        });
    // } else {
    //     res.redirect('/login');
    // }
});

router.get('/__blank.html', function(req, res) {
    res.send('<!DOCTYPE html><html><head></head><body></body></html>')
});

router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive'] }));

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

module.exports = router;
