var express = require('express');
var router = express.Router();
var mime = require('mime');
var userService = require('../services/users.js');
var _ = require('lodash');

router.post('/desktopState', function(req, res) {
    console.log("POST - /api/users/desktopState with data:");
    console.log(req.body);
    if (req.user) {
        var state = req.body;
        var user = req.user;

        userService.updateDesktopState(user, state)
            .then(function() {
                res.json({});
            })
            .catch(function(err) {
                res.json({
                    error: err.toString()
                });
            });
    } else {
        res.json({
            error: 'User must be authenticated!'
        });
    }

});

router.post('/settings', function(req, res) {
    console.log("POST - /api/users/settings with data:");
    console.log(req.body);

    if (req.user) {
        var settings = req.body;
        var user = req.user;

        userService.updateSettings(user, settings)
            .then(function() {
                res.json({});
            })
            .catch(function(err) {
                res.json({
                    error: err.toString()
                });
            });
    } else {
        res.json({
            error: 'User must be authenticated!'
        });
    }

});

router.post('/appData/:packageName', function(req, res) {

    if (req.user) {
        var data = req.body;
        var user = req.user;

        userService.updateAppData(user, req.params.packageName, data)
            .then(function() {
                res.json({});
            })
            .catch(function(err) {
                res.json({
                    error: err.toString()
                });
            });
    } else {
        res.json({
            error: 'User must be authenticated!'
        });
    }

});

router.post('/repoList', function(req, res) {

    if (req.user) {
        var data = req.body;
        var user = req.user;

        userService.updateRepoList(user, data)
            .then(function() {
                res.json({});
            })
            .catch(function(err) {
                res.json({
                    error: err.toString()
                });
            });
    } else {
        res.json({
            error: 'User must be authenticated!'
        });
    }

});

router.get('/getById/:id', function(req, res) {
    var userId = req.params.id;

    userService.getById(userId)
        .then(function(user) {
            if (user) {
                res.json({});
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function(err) {
            res.json({
                error: err.toString()
            });
        });
});

module.exports = router;