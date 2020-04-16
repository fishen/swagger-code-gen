(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("tslib");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var fs_extra_1 = tslib_1.__importDefault(__webpack_require__(7));
var mustache_1 = tslib_1.__importDefault(__webpack_require__(8));
var node_fetch_1 = tslib_1.__importDefault(__webpack_require__(9));
var path_1 = tslib_1.__importDefault(__webpack_require__(3));
var definition_1 = __webpack_require__(10);
var method_1 = __webpack_require__(11);
var Generator = /** @class */ (function () {
    function Generator(config) {
        this.genericTypes = new Map();
        this.config = config;
    }
    Generator.render = function (view, template, filename, config) {
        var content = mustache_1.default.render(fs_extra_1.default.readFileSync(template, 'utf-8'), view);
        var destination = path_1.default.join(config.destination, filename);
        return fs_extra_1.default.ensureFile(destination).then(function () { return fs_extra_1.default.writeFile(destination, content); });
    };
    Generator.getType = function (a, config) {
        var type = a.type, $ref = a.$ref, items = a.items, schema = a.schema;
        if (schema) {
            return Generator.getType(schema, config);
        }
        else if (type in config.typeMappings) {
            return config.typeMappings[type];
        }
        else if ($ref) {
            return Generator.getType({ type: $ref.split('/').pop() }, config);
        }
        else if (type === 'array') {
            return Generator.getType(items, config) + "[]";
        }
        else if (/«.+»$/.test(type)) {
            var start = type.indexOf('«');
            var end = type.lastIndexOf('»');
            var genericType = type.substr(0, start);
            var genericArgType = type.substring(start + 1, end);
            var genericArgTypes = [];
            if (/«.+»$/.test(genericArgType)) {
                genericArgTypes = [Generator.getType({ type: genericArgType }, config)];
            }
            else {
                genericArgTypes = genericArgType.split(',').map(function (type) { return Generator.getType({ type: type }, config); });
            }
            return Generator.getType({ type: genericType }, config) + "<" + genericArgTypes.join(', ') + ">";
        }
        return type;
    };
    Generator.prototype.generate = function () {
        var _this = this;
        var _a = this.config, source = _a.source, templates = _a.templates, filename = _a.filename;
        if (!source)
            throw new Error("The option 'source' is required");
        return node_fetch_1.default(source)
            .then(function (res) { return res.json(); })
            .then(function (json) {
            var definitions = definition_1.Definition.parse(json, _this.config);
            definitions.filter(function (d) { return d.generic && !_this.config.systemGenericTypes.includes(d.name) && d.properties; })
                .forEach(function (d) {
                var def = definitions.find(function (x) { return x.title === d.name; });
                if (def) {
                    if (def.genericProperties)
                        return;
                    var properties_1 = d.properties.filter(function (p) { return p.otherType; }).map(function (p) { return p.name; });
                    def.genericProperties = properties_1;
                    def.properties.filter(function (d) { return properties_1.includes(d.name); }).forEach(function (p) { return p.generic = true; });
                }
                else {
                    var genericProperties_1 = d.properties.filter(function (d) { return d.otherType; }).map(function (p) { return p.name; });
                    d.properties.filter(function (d) { return genericProperties_1.includes(d.name); }).forEach(function (p) { return p.generic = true; });
                    definitions.push(tslib_1.__assign(tslib_1.__assign({}, d), { genericProperties: genericProperties_1, title: d.name, type: d.name, generic: false }));
                }
            });
            return tslib_1.__assign(tslib_1.__assign({}, json), { methods: method_1.Method.parse(tslib_1.__assign(tslib_1.__assign({}, json), { definitions: definitions }), _this.config), definitions: definitions.filter(function (d) { return !d.generic; }), config: _this.config });
        })
            .then(function (view) { return Generator.render(view, templates.type, filename({ name: _this.config.name }), _this.config); });
    };
    return Generator;
}());
exports.Generator = Generator;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(6)))

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var generator_1 = __webpack_require__(2);
var Property = /** @class */ (function () {
    function Property(data, config) {
        this.name = data.name;
        this.type = generator_1.Generator.getType(data, config);
        this.description = data.description;
        // this.default = data.default;
        // this.deprecated = data.deprecated;
        // this.required = data.required;
        this.generic = false;
        this.otherType = !!(data.$ref || data.type === 'array' && data.items.$ref);
    }
    return Property;
}());
exports.Property = Property;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var path_1 = tslib_1.__importDefault(__webpack_require__(3));
var lodash_1 = tslib_1.__importDefault(__webpack_require__(1));
var generator_1 = __webpack_require__(2);
var config_1 = __webpack_require__(13);
function generate(config) {
    var configurations = Object.keys(config)
        .filter(function (name) { return name !== 'common'; })
        .map(function (name) { return lodash_1.default.merge({}, config_1.defaultConfig, config.common, config[name], { name: name }); });
    var promises = configurations.map(function (cfg) { return new generator_1.Generator(cfg).generate(); });
    return Promise.all(promises).then(function () {
        var cfg = lodash_1.default.merge(config_1.defaultConfig, config.common);
        var apis = configurations.map(function (cfg) { return ({
            module: path_1.default.basename(cfg.filename(cfg), '.ts'),
            classname: cfg.classname(cfg),
        }); });
        return generator_1.Generator.render({ apis: apis }, cfg.templates.index, 'index.ts', cfg);
    }).catch(console.error);
}
exports.generate = generate;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("fs-extra");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("mustache");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("node-fetch");

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var property_1 = __webpack_require__(4);
var generator_1 = __webpack_require__(2);
var lodash_1 = tslib_1.__importDefault(__webpack_require__(1));
var Definition = /** @class */ (function () {
    function Definition(data, config) {
        this.title = data.title;
        this.type = generator_1.Generator.getType({ type: this.title }, config);
        this.generic = /<.+>$/.test(this.type);
        this.name = this.generic ? this.type.substr(0, this.type.indexOf('<')) : this.type;
        if (data.properties) {
            this.properties = Object.keys(data.properties).map(function (name) { return new property_1.Property(tslib_1.__assign(tslib_1.__assign({}, data.properties[name]), { name: name }), config); });
            this.properties.forEach(function (p) { return p.required = lodash_1.default.includes(data.required, p.name); });
        }
    }
    Definition.parse = function (swagger, config) {
        var ignoreds = config.ignores.definitions;
        return Object.keys(swagger.definitions)
            .filter(function (title) { return !ignoreds || !ignoreds.includes(title); })
            .map(function (title) { return new Definition(tslib_1.__assign(tslib_1.__assign({}, swagger.definitions[title]), { title: title }), config); });
    };
    return Definition;
}());
exports.Definition = Definition;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var param_1 = __webpack_require__(12);
var lodash_1 = tslib_1.__importDefault(__webpack_require__(1));
var generator_1 = __webpack_require__(2);
var Method = /** @class */ (function () {
    function Method(data, config, swagger) {
        this.method = data.method;
        this.path = data.path;
        this.url = (swagger.basePath + "/" + data.path).replace(/\/+/g, '/');
        this.deprecated = data.deprecated;
        this.operationId = data.operationId;
        this.summary = data.summary;
        this.tags = data.tags;
        this.response = generator_1.Generator.getType(data.responses[200].schema, config);
        if (lodash_1.default.isFunction(config.rename.responseType)) {
            this.response = config.rename.responseType({ type: this.response });
        }
        this.name = config.rename.method(this);
        this.parameters = param_1.Param.from(this, data.parameters, config);
    }
    Method.parse = function (swagger, config) {
        var methods = Object.keys(swagger.paths)
            .reduce(function (result, path) {
            var value = swagger.paths[path];
            Object.keys(value)
                .map(function (method) { return result.push(new Method(tslib_1.__assign({ method: method, path: path }, value[method]), config, swagger)); });
            return result;
        }, []);
        return methods;
    };
    return Method;
}());
exports.Method = Method;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var property_1 = __webpack_require__(4);
var generator_1 = __webpack_require__(2);
var lodash_1 = tslib_1.__importDefault(__webpack_require__(1));
var Param = /** @class */ (function () {
    function Param(data) {
        this.name = data.name;
        this.type = data.type;
        this.properties = data.properties;
    }
    Param.from = function (method, params, config) {
        var ignores = config.ignores;
        if (ignores) {
            params = params.filter(function (x) { return !(x.in in ignores && ignores[x.in].includes(x.name)); });
        }
        var groupedParams = lodash_1.default.groupBy(params, 'in');
        var result = Object.keys(groupedParams).reduce(function (result, key) {
            if (key === 'body') {
                var p = groupedParams[key][0];
                result[key] = new Param({ name: key, type: generator_1.Generator.getType(p, config) });
            }
            else {
                var properties = groupedParams[key].map(function (v) { return new property_1.Property(v, config); });
                var type = config.rename.parameterType({ method: method.name, type: key });
                result[key] = new Param({ name: key, type: type, properties: properties });
            }
            return result;
        }, {});
        return ['query', 'body', 'header'].filter(function (x) { return x in result; }).map(function (key) { return result[key]; });
    };
    return Param;
}());
exports.Param = Param;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var lodash_1 = tslib_1.__importDefault(__webpack_require__(1));
exports.defaultConfig = {
    destination: '.',
    injection: {
        module: 'mp-inject',
        injectable: 'injectable',
        inject: 'inject',
        http: "'http'",
    },
    rename: {
        method: function (_a) {
            var path = _a.path, method = _a.method;
            return lodash_1.default.camelCase(tslib_1.__spread([method], path.split('/')).join('_'));
        },
        parameterType: function (_a) {
            var method = _a.method, type = _a.type;
            return lodash_1.default.upperFirst(method) + lodash_1.default.upperFirst(type);
        },
    },
    templates: {
        type: './templates/type.mustache',
        index: './templates/index.mustache',
    },
    filename: function (_a) {
        var name = _a.name;
        return name + "-api.ts";
    },
    classname: function (_a) {
        var name = _a.name;
        return lodash_1.default.upperFirst(lodash_1.default.camelCase(name)) + 'API';
    },
    systemGenericTypes: ['Set', 'Map', 'WeakMap', 'WeakSet', 'Array', 'Record'],
    typeMappings: {
        "integer": "number",
        "List": "Array",
        "int": "number",
        "Map": "Record",
        "bigdecimal": "number",
        "long": "number",
        "ref": "number",
    },
};


/***/ })
/******/ ])));
//# sourceMappingURL=index.js.map