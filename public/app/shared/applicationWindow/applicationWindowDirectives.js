(function() {
    'use strict';

    function getUndefined() {
        return;
    }

    var module = angular.module('applicationWindow', ['serverApi', 'googleApi']);

    var appWindowTitleMaxLength = 16;
    
    var cachedGet = memoize($.get);

    module.directive('applicationWindow', ['$http', '$compile', 'userService', 'userProfile', 'googleService',
        function($http, $compile, userService, userProfile, googleService) {
            function randomRange(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            var windowIdCounter = randomRange(90000000, 10000000) | 0;

            function windowIdGen() {
                return ++windowIdCounter | 0;
            };

            var maxAppWindowZIndex = 20;
            return {
                restrict: 'E',
                template: '<application-window-top></application-window-top>'
                + '<application-window-content></application-window-content>'
                + '<application-window-resize></application-window-resize>',
                scope: true,
                controller: function() {

                },
                link: {

                    post: function(scope, element, attrs) {
                        userService.getPackageInfo(attrs.packageName, function(_package) {

                            var windowId = (++windowIdCounter);
                            element.attr('application-id', windowId);

                            var packageName = _package.name;

                            var rootPath = _package.repo + _package.src;
                            scope.iconPath = rootPath + '/icon.png';
                            element.iconPath = rootPath + '/icon.png';
                            var frame = document.createElement('iframe');
                            frame.setAttribute('allowFullScreen', 'true');
                            frame.setAttribute('mozAllowFullScreen', 'true');
                            frame.setAttribute('webkitAllowFullScreen', 'true');
                            frame.src = '/__blank.html';

                            element
                                .find('application-window-content')
                                .append(frame);

                            function dispose() {
                                element.detach();
                            }

                            var events = {
                                'ready': [],
                                'quit': [],
                                'open-file': [],
                                'window-blur': [],
                                'window-focus': [],
                            };

                            function dispatchEvent(eventName /* ...args */) {
                                if (eventName in events) {
                                    var callbacks = events[eventName];
                                    var eventArgs = Array.prototype.slice.call(arguments, 1);
                                    for (var i = 0, len = callbacks.length; i < len; ++i) {
                                        callbacks[i].call(frame.contentWindow, eventArgs);
                                    }
                                } else {
                                    throw new Error('`' + eventName + '` is not a valid event.');
                                }
                            };
                            scope.dispatchEvent = dispatchEvent;

                            function addEventListener(eventName, callback) {
                                if (eventName in events) {
                                    var callbacks = events[eventName];
                                    callbacks.push(callback);
                                } else {
                                    throw new Error('`' + eventName + '` is not a valid event.');
                                }
                            };

                            function removeEventListener(eventName, callback) {
                                if (eventName in events) {
                                    var callbacks = events[eventName];
                                    var index = callbacks.indexOf(callback);
                                    if (index !== -1) {
                                        callbacks.splice(index, 1);
                                    }
                                } else {
                                    throw new Error('`' + eventName + '` is not a valid event.');
                                }
                            };


                            addEventListener('quit', function() {
                                angular.element('taskbar-item[taskbar-window-item][data-item-id="' + windowId + '"]').remove();
                            });

                            scope.addTaskbarWindow(element);

                            setTimeout(function() {
                                scope.focusWindow(element);
                            }, 100);

                            /*element.bind('mousedown touchstart', function(e) {
                                var currentZIndex = (element[0].getAttribute('application-id') | 0);
                                var newIndex;
                                var appWindows = scope.desktop.find('application-window');
                                window.appWindows = appWindows;
                                appWindows.sort(function(a, b) {
                                    return (a.style.zIndex | 0) > (b.style.zIndex | 0);
                                });
    
                                var maxWindow = angular.element(appWindows[appWindows.length - 1]);
                                maxWindow.removeClass('focused')
    
                                var currentIndex = (function() {
                                    for (var i = 0; i < appWindows.length; ++i) {
                                        var appWindow = appWindows[i];
                                        if (currentZIndex == appWindow.getAttribute('application-id') | 0) {
                                            return i;
                                        }
                                    }
                                    return -1;
                                })();
    
                                for (var i = currentIndex; i < appWindows.length; ++i) {
                                    var itWindow = appWindows[i];
                                    itWindow.style.zIndex = (itWindow.style.zIndex | 0) - 1;
                                }
                                element.css({ 'z-index': ((maxWindow.css('z-index') | 0) + 1) });
                                element.addClass('focused');
                            });*/

                            /* DRAGGIE */

                            var draggie = new Draggabilly(element[0], {
                                handle: 'application-window-top',
                                containment: 'x-desktop'
                            });

                            draggie.on('dragStart', function(e) {
                                element.addClass('moving');
                                enableContentShadow();
                            });

                            draggie.on('dragEnd', function(e) {
                                element.removeClass('moving');
                                disableContentShadow();
                            });

                            /* END DRAGGIE */

                            var zIndexBackup;

                            function enableContentShadow() {
                                element.css({ 'z-index': maxAppWindowZIndex + 1 });
                                var appWindows = angular.element('application-window');
                                if (element.children().last()[0].className == 'content-shadow') {
                                    return;
                                }
                                var contentShadow = document.createElement('div');
                                contentShadow.className = 'content-shadow';
                                element.append(contentShadow);
                                var backgroundShadow = document.createElement('div');
                                backgroundShadow.className = 'background-shadow';
                                backgroundShadow.style.zIndex = maxAppWindowZIndex + 10;
                                element.parent('application-window-area').append(backgroundShadow);
                            }

                            function disableContentShadow() {
                                element.css({ 'z-index': zIndexBackup });
                                var shadow = element.children().last();
                                if (shadow[0].className == 'content-shadow') {
                                    shadow.remove();
                                }
                                var bgShadow = element.parent('application-window-area').children().last();
                                if (bgShadow[0].className == 'background-shadow') {
                                    bgShadow.remove();
                                }
                            }

                            /* RESIZE */

                            (function() {

                                var startX;
                                var startY;
                                var startWidth;
                                var startHeight;
                                var resizer = element.find('application-window-resize');
                                var doc = angular.element(document.documentElement);

                                function initDrag(e) {
                                    startX = e.clientX;
                                    startY = e.clientY;
                                    startWidth = element.width();
                                    startHeight = element.height();
                                    element.addClass('resizing');
                                    doc.bind('mousemove touchmove', doDrag);
                                    doc.bind('mouseup touchend touchcancel', stopDrag);
                                    enableContentShadow();
                                }

                                function doDrag(e) {
                                    element.css({
                                        width: (startWidth + e.clientX - startX) + 'px',
                                        height: (startHeight + e.clientY - startY) + 'px',
                                    });
                                }

                                function stopDrag() {
                                    element.removeClass('resizing');
                                    doc.unbind('mousemove touchmove', doDrag);
                                    doc.unbind('mouseup touchend touchcancel', stopDrag);
                                    disableContentShadow();
                                }

                                resizer.bind('mousedown touchstart', initDrag);

                            })();

                            (function() {
                                var lastState = 'normal';

                                element.maximize = function() {
                                    if (element.attr('window-state') === 'maximized') {
                                        element.attr({ 'window-state': 'normal' });
                                        draggie.enable();
                                    } else {
                                        element.attr({ 'window-state': 'maximized' });
                                        draggie.disable();
                                    }
                                };

                                element.minimize = function() {
                                    lastState = element.attr('window-state') || 'normal';
                                    element.attr({ 'window-state': 'minimized' });
                                };

                                element.toggleState = function() {
                                    var state = element.attr('window-state');
                                    if (state === 'minimized') {
                                        element.attr({ 'window-state': lastState });
                                    } else {
                                        element.minimize();
                                    }
                                };

                            })();

                            var isFirstLoad = false;
                            frame.addEventListener('load', function() {
                                var frame = this;
                                var frameGlobal = frame.contentWindow;
                                scope.frameGlobal = frameGlobal;
                                frameGlobal.interop = interop;
                                
                                frameGlobal.document.addEventListener('click', function() {
                                    scope.focusWindow(element);
                                });

                                try {
                                    frameGlobal.parent = frameGlobal;
                                    frameGlobal.Object.defineProperty.call(frameGlobal, frameGlobal, 'parent', {
                                        get: function() { return this; },
                                        set: function(value) { return; },
                                    });
                                    frameGlobal.__defineGetter__('parent', function() { return this; });
                                    frameGlobal.__defineSetter__('parent', function(value) { return; });
                                } catch (e) { }

                                try {
                                    frameGlobal.top = frameGlobal.self;
                                    frameGlobal.Object.defineProperty.call(frameGlobal, frameGlobal, 'top', {
                                        get: function() { return this.self; },
                                        set: function(value) { return; },
                                    });
                                    frameGlobal.__defineGetter__('top', function() { return this.self; });
                                    frameGlobal.__defineSetter__('top', function(value) { return; });
                                } catch (e) { }

                                try {
                                    frameGlobal.opener = null;
                                    frameGlobal.Object.defineProperty.call(frameGlobal, frameGlobal, 'opener', {
                                        get: function() { return null; },
                                        set: function(value) { return; },
                                    });
                                    frameGlobal.__defineGetter__('opener', function() { return null; });
                                    frameGlobal.__defineSetter__('opener', function(value) { return; });
                                } catch (e) { }

                                if (!isFirstLoad) {
                                    isFirstLoad = true;
                                    var mainPath = _package.main;
                                    $http({
                                        cache: true,
                                        method: 'GET',
                                        url: rootPath + '/' + mainPath,
                                    }).then(function(res) {
                                        try {
                                            frameGlobal.eval.call(frameGlobal, res.data);
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    }, function() {
                                        console.error('Failed to load package `' + _package.packageName + '`!');
                                    });
                                }
                            });

                            function loadURL(url) {
                                function callback(res) {
                                    var data = res.data;
                                    var frameGlobal = frame.contentWindow;
                                    var base = '<base href="' + rootPath + '/">';
                                    var headStart = data.indexOf('<head');
                                    if (headStart === -1) {
                                        data = base + data;
                                    } else {
                                        var headEnd = data.indexOf('>', headStart);
                                        if (headEnd === -1) {
                                            throw new Error('Irregular HTML structure!');
                                        } else {
                                            data = data.slice(0, headEnd + 1) + base + data.slice(headEnd + 1);
                                        }
                                    }
                                    frameGlobal.document.open();
                                    frameGlobal.document.write(data);
                                    frameGlobal.document.close();
                                };
                                $http({
                                    cache: true,
                                    method: 'GET',
                                    url: url,
                                }).then(callback, function(error) {
                                    throw new Error(error);
                                });
                            };

                            function fixCssUnit(value, fallback) {
                                if (!isNaN(parseInt(value.substr(value.length - 2)))) {
                                    value += fallback || 'px';
                                }
                                return value;
                            };

                            var title = _package.name;
                            function updateTitle(value) {
                                title = value;
                                scope.title = value;
                                element.find('application-window-title').text(value.substr(0, appWindowTitleMaxLength));
                                scope.setTaskbarWindowTitle(windowId, value);
                            }

                            updateTitle(title);

                            var app = {
                                on: addEventListener,
                                off: removeEventListener,
                                quit: function() {
                                    dispatchEvent('quit');
                                    dispose();
                                    scope.saveDesktopState();
                                },
                                getSize: function() {
                                    return {
                                        width: element.css('width'),
                                        height: element.css('height')
                                    };
                                },
                                setSize: function(size) {
                                    element.css('width', fixCssUnit(size.width));
                                    element.css('height', fixCssUnit(size.height));
                                },
                                getData: function() {
                                    return userService.getAppData(packageName);
                                },
                                setData: function(data, callback) {
                                    userService.postAppData(packageName, data, callback);
                                },
                                getWindowId: function() {
                                    return windowId;
                                },
                                getRootPath: function() {
                                    return rootPath;
                                },
                                getTitle: function() {
                                    return title;
                                },
                                setTitle: function(value) {
                                    updateTitle(value);
                                },
                                getPersistence: function() {
                                    return userService.getAppPersistence(packageName).persistence || {};
                                },
                                setPersistence: function(data, callback) {
                                    userService.postAppPersistence(packageName, data, callback);
                                },
                                loadURL: loadURL,
                            };

                            userProfile.data = userProfile.data || {};

                            var interop = {
                                app: app,
                                user: {
                                    name: userProfile.name,
                                    meta: userProfile.meta,
                                },
                            };
                            scope.interop = interop;


                            if (_package.name.indexOf('xwinos.') /* === 0*/) {
                                interop.os = {
                                    getSettings: userService.getSettings,
                                    setSettings: function(settings) {
                                        if (settings.background !== userService.getSettings().background) {
                                            scope.changeBackground(settings.background);
                                        }
                                        userService.postSettings(settings);
                                    },
                                    getGoogleService: function() {
                                        return googleService;
                                    },
                                };
                            }

                            scope.appWindow = element;
                            scope.draggie = draggie;

                        });
                    },
                }
            };
        }]);

    module.directive('applicationWindowTop', function() {
        return {
            restrict: 'E',
            template: '<application-window-header></application-window-header>'
            + '<application-window-buttons></application-window-buttons>',
            link: function(scope, element, attrs) {
                element.bind('mousedown touchstart', function(e) {
                    /* TODO */
                });
            },
        };
    });

    module.directive('applicationWindowIcon', function() {
        return {
            restrict: 'E',
            template: '<img class="application-icon"com src="{{iconPath}}"></img>',
            link: function(scope, element, attrs) {
                //element.css({ 'background-image': 'url("' + scope.interop.app + '")' });

            },
        };
    });

    module.directive('applicationWindowHeader', function() {
        return {
            restrict: 'E',
            template: '<application-window-icon></application-window-icon>'
            + '<application-window-title></application-window-title>',
        };
    });

    module.directive('applicationWindowTitle', function() {
        return {
            restrict: 'E',
        };
    });

    module.directive('applicationWindowButtons', function() {
        return {
            restrict: 'E',
            template: '<application-window-button-minimize></application-window-button-minimize>'
            + '<application-window-button-maximize></application-window-button-maximize>'
            + '<application-window-button-close></application-window-button-close>'
        };
    });

    module.directive('applicationWindowButtonMinimize', function() {
        return {
            restrict: 'E',
            template: '<i class="material-icons">&#xE15B;</i>',
            link: function(scope, element, attrs) {
                element.bind('click', function() {
                    scope.appWindow.minimize();
                });
            },
        };
    });

    module.directive('applicationWindowButtonMaximize', function() {
        return {
            restrict: 'E',
            template: '<i class="material-icons">&#xE5D0;</i>',
            link: function(scope, element, attrs) {
                element.bind('click', function() {
                    scope.appWindow.maximize()
                });
            },
        };
    });

    module.directive('applicationWindowButtonClose', function() {
        return {
            restrict: 'E',
            template: '<i class="material-icons">&#xE5CD;</i>',
            link: function(scope, element, attrs) {
                element.bind('click', function() {
                    scope.interop.app.quit();
                });
            },
        };
    });

    module.directive('applicationWindowContent', function() {
        return {
            restrict: 'E',
            scope: {
                interop: '@',
            },
            link: function(scope, element, attrs) {
                /*rootPath: rootPath,
                    windowId: windowId,
                    icon: rootPath + '/icon.png',
                    title: title,
                    draggie: draggie,
                    appWindow: element,
                    windowState: 'normal',
                    quit: function() {
                        unregisterWindow(windowId);
                    },*/


                element.interop = scope.interop;
            },
        };
    });

    module.directive('applicationWindowResize', function() {
        return {
            restrict: 'E',
            link: function(scope, element, attrs) {
                element.on('click', function(e) {

                });
                element.on('mousedown touchstart', function(e) {

                });
            },
        };
    });

    var windowHandles = {};

    function registerWindow(id, scope, closeCallbacks) {
        windowHandles[id] = [scope, closeCallbacks];
    }

    function getWindowScope(id) {
        return windowHandles[id][0];
    }

    function unregisterWindow(id) {
        var eventState = { cancel: false };
        var appWindow = windowHandles[id];
        if (!appWindow) {
            return;
        }
        var closeCallbacks = appWindow[1];
        for (var i = 0; i < closeCallbacks.length; ++i) {
            if (eventState.cancel == false) {
                closeCallbacks[i](eventState);
            }
        }
        windowHandles[id] = getUndefined();
        var winElem = document.querySelector('application-window[application-id="' + id + '"]');
        winElem.parentNode.removeChild(winElem);
    }

    var applicationWindowApiExport = {
        // createWindow: function,
        // debug: Console,
        unregisterWindow: unregisterWindow,
        registerWindow: registerWindow,
        getWindowScope: getWindowScope,
    };

    var applicationWindowApiScope = true;

    /*  angular.element(document.body).bind('contextmenu', function(e) {
          e.preventDefault();
      });*/

})();