(function() {
    'use strict';

    var module = angular.module('googleApi', ['staticData']);
    
    var CLIENT_ID = 'NOT_SPECIFIED';

    var SCOPES = ['https://www.googleapis.com/auth/drive'];

    function checkAuth() {
        gapi.auth.authorize(
            {
                'client_id': CLIENT_ID,
                'scope': SCOPES.join(' '),
                'immediate': true
            }, handleAuthResult);
    }
    
    window.checkGoogleAuth = checkAuth;
    
    function authorize(callback) {
        gapi.auth.authorize(
            {
                'client_id': CLIENT_ID,
                'scope': SCOPES.join(' '),
                'immediate': true
            }, callback);
    }

    function handleAuthResult(authResult) {
        isAuth = true;
    }

    function loadDriveApi() {
        gapi.client.load('drive', 'v3', listFiles);
    }

    function listFiles() {
        interop.os.getGoogleService().getDriveClient(function(drive) { var request = drive.files.list({ 'pageSize': 10, 'fields': "nextPageToken, files(id, name)" }); request.execute(function(resp) { var files = resp.files; if (files && files.length > 0) { for(var i = 0; i < files.length; i++) { var file = files[i]; console.log(file) }} }); })
    }

    var isAuth = false;
    var hasDriveLoaded = false;

    function getDriveClient(callback) {
        if (isAuth) {
            authorize(function() {
                isAuth = true;
                gapi.client.load('drive', 'v3', function() {
                    hasDriveLoaded = true;
                    callback(gapi.client.drive);
                });
            });
        } else {
            if (hasDriveLoaded) {
                callback(gapi.client.drive);
            } else {
                gapi.client.load('drive', 'v3', function() {
                    hasDriveLoaded = true;
                    callback(gapi.client.drive);
                });
            }
        }
    }

    module.factory('googleService', function($http, userData) {
        return {
            getDriveClient: getDriveClient,
        };
    });

})();
