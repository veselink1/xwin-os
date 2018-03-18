(function() {
    'use strict';

    var module = angular.module('controls', ['desktop']);

    module.directive('applicationIcon', ['userService', function(userService) {
        return {
            restrict: 'E',
            template: '<img/><span></span>',
            link: function(scope, element, attrs) {
                element.bind('click', function() {
                    var sidebar = document.querySelector("x-sidebar");
                    sidebar.dataset.sidebarState = "false";
                    var packageName = attrs.packageName;
                    var title = attrs.title;
                    var src = attrs.src;
                    if (packageName) {
                        scope.createWindow(packageName);
                    } else {
                        throw new Error('applicationIcon : Invalid attributes used!');
                    }
                });
                
                var packageName = attrs.packageName;
                userService.getPackageInfo(packageName, function(packageInfo) {
                    var src = packageInfo.repo + packageInfo.src;
                    if (src.lastIndexOf('/') !== src.length - 1) {
                        src += '/';
                    }
                    var image = src + 'icon.png';
                    element.find('img', 1).attr({ 'src': image });
                    element.find('span', 1)[0].innerHTML = packageInfo.name;
                });
            }
        };

    }]);
    module.directive('desktopIcons', function() {
        return {
            restrict: 'E',
            template: '',
            link: function(scope, element, attrs) {
                var positionIcons = [];
            }
        };

    });
    module.directive('desktopIcon', function() {
        return {
            restrict: 'A',
            template: '',
            link: function(scope, element, attrs) {
                var draggie = new Draggabilly(element[0], {
                });
            }
        };

    });

})();