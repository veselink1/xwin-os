var config = require('./server.js');

module.exports = {
    google: {
        clientID: '60245096456-i1hsjrpk30uilu9h16ine1p2k9em9fjk.apps.googleusercontent.com',
        clientSecret: 'WslJ9zeGDLd1Wy9HCUfWk1Wc',
        callbackURL: config.hostUrl + '/auth/google/callback/',
    }
};