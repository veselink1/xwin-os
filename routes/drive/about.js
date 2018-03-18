'use strict';

let express = require('express');
let router = express.Router();
let driveService = require('../../services/drive');

router.get('/get', function(req, res) {
    if (req.isAuthenticated()) {
        let profile = req.user.google;
        driveService.about.get(profile.accessToken, profile.refreshToken, req.params)
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