(function() {
    'use strict';

    var widgets = {
        'Clock': '/assets/widgets/clock'
    };

    var module = angular.module('desktop', ['staticData', 'serverApi']);

    module.directive('desktop', ['$compile', 'userProfile', 'userData', 'userService', function($compile, userProfile, userData, userService) {
        var desktopCounter = 0;
        return {
            template: '<x-sidebar></x-sidebar>'
            + '<desktop-icons></desktop-icons>'
            + '<application-window-area></application-window-area>'
            + '<x-taskbar></x-taskbar>',
            link: function(scope, element, attrs) {
                
                function dispose() {
                    element.find('application-window').each(function(index, appWin) {
                        angular.element(appWin)
                            .scope()
                            .interop.app.quit();
                    });
                }
                
                window.addEventListener('beforeunload', function(e) {
                    dispose();
                }, false);
                
                (function loadSettings() {
                    var settings = userService.getSettings();
                    changeBackground(settings.background || 'white');
                })();

                function saveDesktopState() {
                    var state = [];
                    var windows = element.find('application-window');
                    windows.each(function(_, _xwin) {
                        var xwin = angular.element(_xwin);
                        state.push({
                            packageName: xwin.attr('package-name'),
                            style: xwin.attr('style'),
                        });
                    });
                    userService.postDesktopState(state, console.error.bind(console));
                }

                function createWindow(packageName, callback) {
                    var appHtml = '<application-window package-name="' + packageName + '">'
                        + '</application-window>';
                    setTimeout(function() {
                        saveDesktopState();
                    }, 400);
                    var el = $compile(appHtml)(scope);
                    var area = element.find('application-window-area');
                    area.append(el);
                    var xwin = area.last();
                    return xwin;
                };

                function loadFromState(state) {
                    for (var i = 0, len = state.length; i < len; ++i) {
                        var s = state[i];
                        createWindow(s.packageName, function(xwin) {
                            xwin.attr({ 'style': s.style });
                            var fglobal = xwin.find('iframe', 1)[0].contentWindow;
                            contentWindow.savedState = s.savedState;
                        });
                    }
                };

                if (userData && userData.desktopState) {
                    loadFromState(userData.desktopState);
                }

                element.attr({ 'desktop-id': ++desktopCounter });

                scope.desktop = element;
                scope.createWindow = createWindow;

                document.title = userProfile.name + "'s Desktop";

                function changeBackground(value) {
                    element.css({ 'background-image': value });
                };
                scope.changeBackground = changeBackground;

                function loadWidget(name) {
                    var widgetSrc = widgets[name];
                    var frame = document.createElement('iframe');
                    frame.className = 'widget';
                    frame.style.border = 'none';
                    frame.style.overflow = 'hidden';
                    frame.style.width = '300px';
                    frame.style.height = '300px';
                    frame.src = widgetSrc;
                    element.append(frame);
                }

                loadWidget('Clock');

                scope.sidebar = {};
                scope.saveDesktopState = saveDesktopState;
                scope.addTaskbarWindow = function(parentWindow) {
                    var windowId = parentWindow.attr('application-id');
                    var taskbar = element.find('x-taskbar');
                    var taskbarScope = taskbar.scope().$new(true);
                    taskbarScope.parentWindow = parentWindow;

                    var taskbarWindow = $compile("<taskbar-item taskbar-window-item data-item-id='" + windowId + "'></taskbar-item>")(taskbarScope);
                    taskbar.append(taskbarWindow);
                    var taskbarHandleScope = taskbar.last().scope();
                    taskbarHandleScope.iconPath=parentWindow.iconPath;
                };
                
                scope.setTaskbarWindowTitle = function(windowId, title) {
                    element
                        .find('[taskbar-window-item][data-item-id="'+ windowId +'"]')
                        .scope().setTitle(title);
                };
                
                scope.setTaskbarWindowTitle = function(windowId, title) {
                    element
                        .find('[taskbar-window-item][data-item-id="'+ windowId +'"]')
                        .scope().setTitle(title);
                };
                
                var maxWindowZIndex = 10;
                scope.focusWindow = function(appWin) {
                    if (!appWin.hasClass('focused') || appWin.css('z-index') != maxWindowZIndex) {
                        element.find('application-window').each(function(index, otherWin) {
                            if (otherWin.getAttribute('application-id') != appWin[0].getAttribute('application-id')) {
                                var $otherWin = angular.element(otherWin);
                                $otherWin.removeClass('focused');
                                $otherWin.addClass('blurred');
                                $otherWin.scope().dispatchEvent('window-blur');
                            }
                        });
                        appWin.addClass('focused');
                        appWin.removeClass('blurred');
                        appWin.css('z-index', ++maxWindowZIndex);
                        appWin.scope().dispatchEvent('window-focus');
                    }
                };

            },
        };
    }]);


})();