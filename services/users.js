var config = require('../config/server.js');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var passport = require('passport');
var passportConfig = require('../config/passport.js')(passport);
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var User = require('../models/user');
var db = mongoose.connection;
var Q = require('q');
var User = require('../models/user.js');
var _ = require('lodash');

function save(user, callback) {
    var deferred = Q.defer();
    user.save(function(err) {
        if(err) {
            return deferred.reject(err);
        }
        console.log("saved user");
        console.log(user.data.settings)
        return deferred.resolve();
    });
    return deferred.promise;
}

function updateSettings(user, data) {
    user.markModified('data.settings');
    user.data.settings = data;
    return save(user);
}

function updateDesktopState(user, state) {
    user.markModified('data.desktopState');
    user.data.desktopState = state;
    return save(user);
}

function updateAppData(user, packageName, data) {
    user.markModified('data.apps');
    user.data.apps[packageName] = data;
    return save(user);
}

function updateRepoList(user, repoList) {
    user.markModified('data.repoList');
    user.data.repoList = repoList;
    return save(user);
}

function getById(id) {
    var deferred = Q.defer();
    User.findById(id, function (err, user) {
        if (err) {
            deferred.reject(err);
        }

        if (!user) {
            deferred.resolve();
        }

        deferred.resolve(user);
    });

    return deferred.promise;
}

function _delete(user) {
    user.remove();
}

var service = {
    getById: getById,
    updateAppData: updateAppData,
    updateDesktopState: updateDesktopState,
    updateSettings: updateSettings,
    delete: _delete,
};

module.exports = service;