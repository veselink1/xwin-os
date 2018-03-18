var express = require('express');
var router = express.Router();

router.use('/files', require('./files'));

module.exports = router;
