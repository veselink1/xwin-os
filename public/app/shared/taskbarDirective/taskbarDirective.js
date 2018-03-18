(function() {
    'use strict';

    var module = angular.module('taskbar', ['desktop']);

    module.directive('taskbar', function() {
        new StyleBuilder('taskbar-item[taskbar-button].taskbar-fullscreen')
        .set({
            'float': 'right',
            'padding-top': '0.6em',
        }).done();
        return {
            restrict: 'E',
            template: '<taskbar-item><div class="start-button"></div></taskbar-item>'
                + '<taskbar-item class="notification-area"></taskbar-item>'
                + '<taskbar-item class="taskbar-clock"></taskbar-item>'
                + '<taskbar-item taskbar-button class="taskbar-fullscreen"></taskbar-item>',
            link: function(scope, element, attrs) {
                element.find('.start-button').bind('click', function() {
                    var sidebar;
                    sidebar = document.querySelector("x-sidebar");
                    var state = (sidebar.dataset.sidebarState === 'true');
                    sidebar.dataset.sidebarState = !state;
                });
                
                /* FULLSCREEN BUTTON */
                (function() {
                    var btn = element.find('.taskbar-fullscreen');
                    btn.html('<i class="material-icons">&#xE5D0;</i>');
                    btn.bind('click', function(event) {
                        toggleFullscreen(scope.desktop[0]);
                    });
                })();

                /* END FULLSCREEN BUTTON */ 

                /* TASKBAR CLOCK */
                (function() {
                    var style = document.createElement('style');
                    style.innerHTML = 
                        'display: inline-block;' +
                        'float: right;' +
                        'height: 100%;' +
                        'line-height: 2.75em;' +
                        'padding-left: 1em;' +
                        'padding-right: 1em;';
                    document.head.appendChild(style);
                    var clock = element.find('.taskbar-clock');
                    setInterval(function() {
                        var d = new Date();
                        var hours = d.getHours();
                        var minutes = d.getMinutes();
                        if((minutes + '').length == 1) {
                            minutes = '0' + minutes;
                        }
                        clock.html(hours % 12 + ':' + minutes + ' ' + (hours > 12 ? 'PM' : 'AM'));
                    }, 1000);
                })();

                /* END TASKBAR CLOCK */
            }
        };
    });

    module.directive('taskbarItem', function() {
        return {
            restrict: 'E',
        };
    });
    
    module.directive('taskbarGroup', function() {
        new StyleBuilder('taskbar-group')
        .set({
            'overflow-x': 'auto',
            'overflow-y': 'hidden',
        }).done();
        return {
            restrict: 'E',
        };
    });
    
    module.directive('taskbarButton', function() {
        return {
            restrict: 'A',
        };
    });

    module.directive('taskbarWindowItem', function() {
        return {
            //  var win=angular.element('[application-id="'+element[0].dataset.itemId+'"]');
            restrict: 'A',
           // template: '<img class="application-icon" src="{{iconPath}}"></img>',
            link: {
                pre: function(scope, element, attrs) {
                    element.html('<p class="taskbar-item-text"></p>');
                    scope.setTitle = function(value) {
                        element.find('.taskbar-item-text').text(value);
                    };
                },
                post: function(scope, element, attrs) {
                    var itemText = element.find('p.taskbar-item-text');
                    var parent = scope.parentWindow;
                    var parentScope = parent.scope();
                    var icon = document.createElement('img');
                    icon.src=parentScope.iconPath;
                    icon.setAttribute('class','taskbar-icon');
                    element[0].appendChild(icon);
                    element.bind('click', function(e) {
                        parentScope.appWindow.toggleState();
                    });
                },
            }
        };
    });


})();