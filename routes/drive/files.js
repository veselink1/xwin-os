var express = require('express');
var router = express.Router();
var driveService = require('../../services/drive');

router.get('/list', function(req, res) {
    var profile = req.user.google;
    driveService.files.list(profile.accessToken, profile.refreshToken, req.params)
        .then(function(driveResponse) {
            res.json(driveResponse);
        })
        .catch(function(err) {
            res.json({
                error: err.toString()
            });
        });
});

module.exports = router;