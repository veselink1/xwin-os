
(function() {

    'use strict';

    var module = angular.module('serverApi', ['staticData']);

    var defaultRepos = [
        '/repo',
    ];
    var repoCache = {};
    var packagesCache = {};
    var changes = true;
    var packageInfoCache = {};
    var staticDataCache = null;

    module.factory('userService', ['$http', 'userData', function($http, userData) {
        function postAppData(packageName, data, callback) {
            userData.apps = userData.apps || {};
            userData.apps[packageName] = data;
            $http.post('/api/user/appData/' + packageName, data)
                .then(function(res) { // success
                    var err = res.data.error;
                    if (!err) {
                        if (callback) callback(null);
                    } else {
                        if (callback) callback(err);
                    }
                }, function(res) { // error
                    if (callback) callback(res.data || 'Request failed!');
                });
        };
        function getAppData(packageName) {
            var ret = {};
            $.extend(true, ret, userData.apps[packageName] || {});
            return ret;
        };
        function postAppPersistence(packageName, data, callback) {
            var data = getAppData(packageName);
            data.persistence = data;
            postAppData(packageName, data, callback);
        };
        function getAppPersistence(packageName) {
            var ret = {};
            $.extend(true, ret, (userData.apps[packageName] || {}).persistence || {});
            return ret;
        };
        function postSettings(settings, callback) {
            $.extend(true, userData.settings, settings);
            $http.post('/api/user/settings/', settings)
                .then(function(res) { // success
                    var err = res.data.error;
                    if (!err) {
                        if (callback) callback(null);
                    } else {
                        if (callback) callback(err);
                    }
                }, function(res) { // error
                    if (callback) callback(res.data || 'Request failed!');
                });
        };
        function getSettings() {
            var ret = {};
            $.extend(true, ret, userData.settings);
            return ret;
        };
        function getDesktopState() {
            var ret = {};
            $.extend(true, ret, userData.desktopState);
            return ret;
        };
        function postDesktopState(state, callback) {
            userData.desktopState = state;
            $http.post('/api/user/desktopState', state)
                .then(function(res) { // success
                    var err = res.data.error;
                    if (!err) {
                        if (callback) callback(null);
                    } else {
                        if (callback) callback(err);
                    }
                }, function(res) { // error
                    if (callback) callback(res.data || 'Request failed!');
                });
        };
        function postRepoList(list, callback) {
            changes = true;
            userData.repoList = list;
            $http.post('/api/user/repoList', list)
                .then(function(res) { // success
                    var err = res.data.error;
                    if (!err) {
                        if (callback) callback(null);
                    } else {
                        if (callback) callback(err);
                    }
                }, function(res) { // error
                    if (callback) callback(res.data || 'Request failed!');
                });
        };
        function getRepoList() {
            var ret = {};
            $.extend(true, ret, userData.repoList || defaultRepos);
            return ret;
        };
        function getRepo(repoUrl, callback) {
                var baseUrl;
                baseUrl = repoUrl.replace('/packages.json', '');
                if (baseUrl.lastIndexOf('/') === baseUrl.length - 1) {
                    baseUrl = baseUrl.substr(0, baseUrl.length - 1);
                }
                if (repoUrl in repoCache) {
                    return repoCache[baseUrl];
                } else {
                    $http.get(baseUrl + '/repo.json')
                        .then(function(res) {
                            repoCache[baseUrl] = res.data;
                            callback(null, res.data);
                        }, function(res) { // error
                            if (callback) callback(res.data || 'Request failed!', null);
                        });
                }
            };
            function getAllPackages(callback, dest) {
                if (changes) {
                    dest = dest || {};
                    var repoList = userService.getRepoList();
                    var len = Object.keys(repoList).length;
                    var i = 0;
                    for (var index in repoList) {
                        if (repoList.hasOwnProperty(index)) {
                            userService.getRepo(repoList[index], function(err, data) {
                                for (var packageName in data.packages) {
                                    var lpack = data.packages[packageName];
                                    var pack = {};
                                    pack.src = lpack.src;
                                    pack.packageName = packageName;
                                    pack.repo = repoList[index];
                                    dest[packageName] = pack;
                                }
                                if (len - 1 === i++) {
                                    changes = false;
                                    packagesCache = dest;
                                    callback(dest);
                                }
                            });
                        }
                    }
                } else {
                    callback(packagesCache);
                }
            };
            function getPackage(packageName, callback) {
                getAllPackages(function(packages) {
                    callback(packages[packageName]);
                });
            };
            function getPackageInfo(packageName, callback) {
                try {
                    getPackage(packageName, function(pack) {
                        var rootPath = pack.repo + pack.src;
                        if (packageName in packageInfoCache) {
                            callback(packageInfoCache[rootPath]);
                        } else {
                            $http({
                                method: 'GET',
                                url: rootPath + '/package.json',
                            }).then(function(res) {
                                var json = res.data;
                                var packageInfo = {};
                                packageInfo.src = pack.src;
                                packageInfo.packageName = pack.packageName;
                                packageInfo.repo = pack.repo;
                                packageInfo.icon = pack.repo + pack.src + '/icon.png';
                                packageInfo.version = json.version;
                                packageInfo.name = json.name;
                                packageInfo.main = json.main;
                                packageInfo.description = json.description;
                                packageInfoCache[rootPath] = res.data;
                                callback(packageInfo);
                            }, function() {
                                callback(null);
                            });
                        }
                    });
                } catch (e) {
                    console.error(e);
                }
            };
        var userService = {
            postAppData: postAppData,
            getAppData: getAppData,
            postSettings: postSettings,
            getSettings: getSettings,
            getDesktopState: getDesktopState,
            postDesktopState: postDesktopState,
            postRepoList: postRepoList,
            getRepoList: getRepoList,
            getRepo: getRepo,
            getAllPackages: getAllPackages,
            getPackage: getPackage,
            getPackageInfo: getPackageInfo,
        };
        return userService;
    }]);

})();