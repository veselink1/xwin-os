(function() {
    'use strict';

    var module = angular.module('sidebar', ['desktop']);
    
    var packages = {};
    
    module.filter('search', function() {
        return function(input) {
            var _input = input.toLowerCase();
            for (var key in packages) if (packages.hasOwnProperty(key)) {
                var value = packages[key];
                if (value.indexOf(_input) !== -1) {
                    return true;
                }
            }
        };
    });

    module.directive('sidebar', ['$compile', '$q', 'userService', 'userProfile', function($compile, $q, userService, userProfile) {
        return {
            restrict: 'E',
            template: '<sidebar-item class="account-info">'
            + '<div class="account-picture"></div>'
            + '<div class="account-username">{{ name }}<br>{{ email }}</div>'
            + '<div class="account-button"></div>'
            + '</sidebar-item>'
            + '<sidebar-item class="account-search"><input placeholder="Find your apps" type="search" class="search" ng-model="searchApp"></sidebar-item>'
            + '<sidebar-item class="applications" data-simplebar-direction="vertical">'
            + '<application-icon ng-repeat="(key, value) in packages track by key | orderBy:\'value.name\'" package-name="{{key}}"></application-icon>'
            + '</sidebar-item>',
            link: function(scope, element, attrs) {
                element[0].dataset.sidebarState = false;
                var accountPicture = element[0].querySelector('.account-picture');
                var background = userProfile.image;
                accountPicture.style.backgroundImage = 'url("' + background + '")';

                scope.name = userProfile.name;
                scope.email = userProfile.email;
                
                packages = {};
                scope.packages = packages;

                var applications = element.find('.applications', 1);

                userService.getAllPackages(function(packages) {}, packages);
                
            }
        };
    }]);

    module.directive('sidebarItem', function() {
        return {
            restrict: 'E',
            template: '',
            link: function(scope, element, attrs) {

            }
        };
    });



})();