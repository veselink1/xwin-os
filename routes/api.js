var express = require('express');
var router = express.Router();

var usersRoute = require('./user');
router.use('/user', usersRoute);

var driveRoute = require('./drive');
router.use('./drive', driveRoute);

module.exports = router;
