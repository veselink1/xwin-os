'use strict';

let express = require('express');
let router = express.Router();
let driveService = require('../../services/drive');

router.delete('/delete', function(req, res) {
    console.log('POST - /api/drive/children: ' + req.body);
    if (req.isAuthenticated()) {
        let profile = req.user.google;
        driveService.children.delete(profile.accessToken, profile.refreshToken, req.body)
            .then(function(driveResponse) {
                res.json(driveResponse);
            })
            .catch(function(err) {
                res.json({
                    error: err.toString()
                });
            });
    } else {
        res.json({
            error: 'User not authenticated!'
        });
    }
});

router.get('/get', function(req, res) {
    console.log('GET - /api/drive/get: ' + req.params);
    if (req.isAuthenticated()) {
        let profile = req.user.google;
        driveService.children.get(profile.accessToken, profile.refreshToken, req.params)
            .then(function(driveResponse) {
                res.json(driveResponse);
            })
            .catch(function(err) {
                res.json({
                    error: err.toString()
                });
            });
    } else {
        res.json({
            error: 'User not authenticated!'
        });
    }
});

router.post('/insert', function(req, res) {
    console.log('POST - /api/drive/insert: ' + req.body);
    if (req.isAuthenticated()) {
        let profile = req.user.google;
        driveService.children.insert(profile.accessToken, profile.refreshToken, req.body)
            .then(function(driveResponse) {
                res.json(driveResponse);
            })
            .catch(function(err) {
                res.json({
                    error: err.toString()
                });
            });
    } else {
        res.json({
            error: 'User not authenticated!'
        });
    }
});

router.get('/list', function(req, res) {
    console.log('GET - /api/drive/list: ' + req.params);
    if (req.isAuthenticated()) {
        let profile = req.user.google;
        driveService.children.list(profile.accessToken, profile.refreshToken, req.params)
            .then(function(driveResponse) {
                res.json(driveResponse);
            })
            .catch(function(err) {
                res.json({
                    error: err.toString()
                });
            });
    } else {
        res.json({
            error: 'User not authenticated!'
        });
    }
});

module.exports = router;