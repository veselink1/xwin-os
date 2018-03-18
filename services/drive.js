var google = require('googleapis');
var googleConfig = require('../config/auth.js').google;
var OAuth2 = google.auth.OAuth2;
var Q = require('q');

var oauth2Client = new OAuth2(googleConfig.clientID,
    googleConfig.clientSecret,
    googleConfig.callbackUrl);

function driveAuth(accessToken, refreshToken, action) {
    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
    });

    var deferred = Q.defer();
    var drive = google.drive({ version: 'v3', auth: oauth2Client });

    action(deferred, drive);

    return deferred.promise;
}

var files = {

    copy: function (accessToken, refreshToken, params) {
        return driveAuth(accessToken, refreshToken, function(deferred, drive) {
            if(!params || !params.fileId || !params.resource) {
                throw new Error('Invalid params object: ' + JSON.stringify(params));
            } else {
                drive.files.copy(params, function(err, res) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(res);
                    }
                });
            }
        })
    },

    create: function (accessToken, refreshToken, params) {
        return driveAuth(accessToken, refreshToken, function(deferred, drive) {
            if(!params || !params.resource || !params.media || !params.media.mimeType || !params.media.body) {
                throw new Error('Invalid params object: ' + JSON.stringify(params));
            } else {
                drive.files.create(params, function(err, res) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(res);
                    }
                });
            }
        })
    },

    delete: function (accessToken, refreshToken, params) {
        return driveAuth(accessToken, refreshToken, function(deferred, drive) {
            if(!params || !params.fileId) {
                throw new Error('Invalid params object: ' + JSON.stringify(params));
            } else {
                drive.files.delete(params, function(err, res) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(res);
                    }
                });
            }
        })
    },

    emptyTrash: function (accessToken, refreshToken, params) {
        return driveAuth(accessToken, refreshToken, function(deferred, drive) {
            drive.files.emptyTrash(params, function(err, res) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(res);
                }
            });
        })
    },

    export: function (accessToken, refreshToken, params) {
        return driveAuth(accessToken, refreshToken, function(deferred, drive) {
            if(!params || !params.fileId || !params.mimeType) {
                throw new Error('Invalid params object: ' + JSON.stringify(params));
            } else {
                drive.files.export(params, function(err, res) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(res);
                    }
                });
            }
        })
    },

    generateIds: function (accessToken, refreshToken, params) {
        return driveAuth(accessToken, refreshToken, function(deferred, drive) {
            drive.files.generateIds(params, function(err, res) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(res);
                }
            });
        })
    },

    get: function (accessToken, refreshToken, params) {
        return driveAuth(accessToken, refreshToken, function(deferred, drive) {
            if(!params || !params.fileId) {
                throw new Error('Invalid params object: ' + JSON.stringify(params));
            } else {
                drive.files.get(params, function(err, res) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(res);
                    }
                });
            }
        })
    },

    list: function (accessToken, refreshToken, params) {
        return driveAuth(accessToken, refreshToken, function(deferred, drive) {
            drive.files.list(params, function(err, res) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(res);
                }
            });
        })
    },

    update: function (accessToken, refreshToken, params) {
        return driveAuth(accessToken, refreshToken, function(deferred, drive) {
            if(!params || !params.resource || !params.media || !params.media.mimeType || !params.media.body) {
                throw new Error('Invalid params object: ' + JSON.stringify(params));
            } else {
                drive.files.update(params, function(err, res) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(res);
                    }
                });
            }
        })
    },

    watch: function (accessToken, refreshToken, params) {
        return driveAuth(accessToken, refreshToken, function(deferred, drive) {
            if(!params || !params.resource || !params.fileId) {
                throw new Error('Invalid params object: ' + JSON.stringify(params));
            } else {
                drive.files.watch(params, function(err, res) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(res);
                    }
                });
            }
        })
    },

};

module.exports = {
    files: files,
};
