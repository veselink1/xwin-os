function StyleBuilder(selector) {
    'use strict';
    
    var style = document.createElement('style');
    
    style.innerHTML = selector + '{'
    
    this.done = function() {
        style.innerHTML += '}';
        document.body.appendChild(style);
    };
    
    this.set = function() {
        if (arguments.length === 1 
            && typeof arguments[0] === typeof {}) {
            var props = arguments[0];
            for (var prop in props) {
                style.innerHTML += prop + ':' + props[prop] + ';';
            }
        } else if (arguments.length === 2 
            && typeof arguments[0] === typeof ''){
            style.innerHTML += name + ':' + value + ';';
        } else {
            throw new Error("Failed to execute 'set' on 'StringBuilder': invalid parameters.");
        }
        return this;
    };
    
};

var memoize = (function() {
    'use strict';

    function hashString(str) {
        var hash = 0, i, chr, len;
        if (str.length === 0) {
            return hash;
        }
        for (i = 0, len = str.length; i < len; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return hash;
    };

    return function memoize(f, hash) {
        var cache = [];
        return function() {
            var args = JSON.stringify(Array.prototype.slice.call(arguments));
            var key = hash ? hashString(args) : args;
            console.log(cache)
            if (key in cache) {
                return cache[key];
            } else {
                var out = f.apply(this, arguments);
                cache[key] = out;
                return out;
            }
        }
    };

})();

function requestFullscreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    }
}

function exitFullscreen(elem) {
    if (elem.exitFullscreen) {
        elem.exitFullscreen();
    } else if (elem.msExitFullscreen) {
        elem.msExitFullscreen();
    } else if (elem.mozCancelFullScreen) {
        elem.mozCancelFullScreen();
    } else if (elem.webkitExitFullscreen) {
        elem.webkitExitFullscreen();
    }
}

function toggleFullscreen(elem) {
    if (!document.fullscreenElement 
        && !document.mozFullScreenElement 
        && !document.webkitFullscreenElement 
        && !document.msFullscreenElement) {
        requestFullscreen(elem);
    } else {
        exitFullscreen(elem);
    }
}