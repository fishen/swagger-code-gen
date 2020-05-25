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
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
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
exports.Generator = void 0;
const tslib_1 = __webpack_require__(0);
const fs_extra_1 = tslib_1.__importDefault(__webpack_require__(4));
const mustache_1 = tslib_1.__importDefault(__webpack_require__(7));
const node_fetch_1 = tslib_1.__importDefault(__webpack_require__(8));
const path_1 = tslib_1.__importDefault(__webpack_require__(3));
const definition_1 = __webpack_require__(9);
const method_1 = __webpack_require__(10);
class Generator {
    constructor(config) {
        this.genericTypes = new Map();
        this.config = config;
        this.config.defaults = Array.isArray(this.config.defaults) ? this.config.defaults : [];
    }
    static render(view, template, filename, config) {
        const content = mustache_1.default.render(fs_extra_1.default.readFileSync(template, 'utf-8'), view);
        const destination = path_1.default.join(config.destination, filename);
        return fs_extra_1.default.ensureFile(destination).then(() => fs_extra_1.default.writeFile(destination, content));
    }
    static getType(item, config) {
        if (!item)
            return 'void';
        const { type, $ref, items, schema } = item;
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
            return `${Generator.getType(items, config)}[]`;
        }
        else if (/«.+»$/.test(type)) {
            const start = type.indexOf('«');
            const end = type.lastIndexOf('»');
            const genericType = type.substr(0, start);
            const genericArgType = type.substring(start + 1, end);
            let genericArgTypes = [];
            if (/«.+»$/.test(genericArgType)) {
                genericArgTypes = [Generator.getType({ type: genericArgType }, config)];
            }
            else {
                genericArgTypes = genericArgType.split(',').map(type => Generator.getType({ type }, config));
            }
            return `${Generator.getType({ type: genericType }, config)}<${genericArgTypes.join(', ')}>`;
        }
        return type;
    }
    generate() {
        const { source, templates, rename } = this.config;
        if (!source)
            throw new Error("The option 'source' is required");
        return node_fetch_1.default(source)
            .then(res => res.json())
            .then(json => {
            const definitions = definition_1.Definition.parse(json, this.config);
            definitions.filter(d => d.generic && !this.config.systemGenericTypes.includes(d.name) && d.properties)
                .forEach(d => {
                const def = definitions.find(x => x.title === d.name);
                if (def) {
                    if (def.genericProperties)
                        return;
                    const properties = d.properties.filter(p => p.otherType).map(p => p.name);
                    def.genericProperties = properties;
                    def.properties.filter(d => properties.includes(d.name)).forEach(p => p.generic = true);
                }
                else {
                    const genericProperties = d.properties.filter(d => d.otherType).map(p => p.name);
                    d.properties.filter(d => genericProperties.includes(d.name)).forEach(p => p.generic = true);
                    definitions.push({ ...d, genericProperties, title: d.name, type: d.name, generic: false });
                }
            });
            return {
                ...json,
                methods: method_1.Method.parse({ ...json }, definitions, this.config),
                definitions: definitions.filter(d => !d.generic),
                config: this.config
            };
        })
            .then(view => Generator.render(view, templates.type, rename.file({ name: this.config.name }), this.config));
    }
}
exports.Generator = Generator;


/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("fs-extra");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Property = void 0;
const generator_1 = __webpack_require__(2);
class Property {
    constructor(data, config) {
        this.name = data.name;
        this.type = generator_1.Generator.getType(data, config);
        this.description = data.description;
        this.default = data.default;
        this.example = data.example;
        // this.deprecated = data.deprecated;
        this.required = data.required;
        this.generic = false;
        this.otherType = !!(data.$ref || data.type === 'array' && data.items.$ref);
    }
}
exports.Property = Property;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const tslib_1 = __webpack_require__(0);
const path_1 = tslib_1.__importDefault(__webpack_require__(3));
const lodash_1 = tslib_1.__importDefault(__webpack_require__(1));
const generator_1 = __webpack_require__(2);
const fs_extra_1 = tslib_1.__importDefault(__webpack_require__(4));
const config_1 = __webpack_require__(12);
function generate(config) {
    const configurations = Object.keys(config)
        .filter(name => name !== 'common')
        .map(name => lodash_1.default.merge({}, config_1.defaultConfig, config.common, config[name], { name }));
    const promises = configurations.map(cfg => new generator_1.Generator(cfg).generate());
    return Promise.all(promises).then(() => {
        const cfg = lodash_1.default.merge(config_1.defaultConfig, config.common);
        const apis = configurations.map(cfg => ({
            module: path_1.default.basename(cfg.rename.file(cfg), '.ts'),
            classname: cfg.rename.class(cfg),
        }));
        fs_extra_1.default.copyFileSync(path_1.default.resolve(__dirname, './templates/type.ts'), path_1.default.join(cfg.destination, 'type.ts'));
        return generator_1.Generator.render({ apis }, cfg.templates.index, 'index.ts', cfg);
    }).catch(console.error);
}
exports.generate = generate;


/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("mustache");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("node-fetch");

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Definition = void 0;
const tslib_1 = __webpack_require__(0);
const property_1 = __webpack_require__(5);
const generator_1 = __webpack_require__(2);
const lodash_1 = tslib_1.__importDefault(__webpack_require__(1));
class Definition {
    constructor(data, config) {
        this.title = data.title;
        this.type = generator_1.Generator.getType({ type: this.title }, config);
        this.generic = /<.+>$/.test(this.type);
        this.name = this.generic ? this.type.substr(0, this.type.indexOf('<')) : this.type;
        if (data.properties) {
            this.properties = Object.keys(data.properties).map((name) => new property_1.Property({ ...data.properties[name], name }, config));
            this.properties.forEach(p => p.required = lodash_1.default.includes(data.required, p.name));
        }
    }
    static parse(swagger, config) {
        const ignoreds = config.ignores && config.ignores.definitions;
        return Object.keys(swagger.definitions)
            .filter(title => !ignoreds || !ignoreds.includes(title))
            .map((title) => new Definition({ ...swagger.definitions[title], title }, config));
    }
}
exports.Definition = Definition;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Method = void 0;
const tslib_1 = __webpack_require__(0);
const param_1 = __webpack_require__(11);
const lodash_1 = tslib_1.__importDefault(__webpack_require__(1));
const generator_1 = __webpack_require__(2);
class Method {
    constructor(data, config, swagger) {
        this.method = data.method;
        this.path = data.path;
        this.url = `${swagger.basePath}/${data.path}`.replace(/\/+/g, '/');
        if (config.host !== false) {
            let { host, scheme } = config;
            host = lodash_1.default.isString(host) ? host : swagger.host;
            scheme = lodash_1.default.isString(scheme) ? scheme : (swagger.schemes && swagger.schemes[0]) || 'https';
            this.url = host && scheme ? `${scheme}://${host}${this.url}` : this.url;
        }
        this.deprecated = data.deprecated;
        this.operationId = data.operationId;
        this.summary = data.summary;
        this.tags = data.tags;
        const resSchema = data.responses[200] && data.responses[200].schema;
        this.response = generator_1.Generator.getType(resSchema, config);
        if (lodash_1.default.isFunction(config.rename.response)) {
            this.response = config.rename.response({ type: this.response });
        }
        this.name = config.rename.method(this);
        this.parameters = param_1.Param.from(this, data.parameters, config);
        this.parameters.filter(p => p.in === 'path')
            .map(p => new RegExp(`\{(${p.name})\}`, 'g'))
            .forEach(reg => this.url = this.url.replace(reg, "${$1}"));
    }
    setDefault(param, defaults) {
        if (!Array.isArray(param.properties))
            return;
        const defaultNames = param.properties.filter(p => defaults.includes(p.name)).map(p => p.name);
        if (!defaultNames.length)
            return;
        param.type = `$Optional<${param.type}, ${defaultNames.map(p => `'${p}'`).join(' | ')}>`;
        this.defaults = this.defaults || [];
        this.defaults.push({ key: param.in, value: defaultNames });
    }
    static parse(swagger, definitions, config) {
        const methods = Object.keys(swagger.paths)
            .reduce((result, path) => {
            const value = swagger.paths[path];
            Object.keys(value).map(method => {
                const m = new Method({ method, path, ...value[method] }, config, swagger);
                m.parameters.forEach((param) => {
                    if (param.in === 'body') {
                        const d = definitions.find(d => d.type === param.type);
                        param.properties = d && d.properties;
                    }
                    m.setDefault(param, config.defaults);
                });
                for (let index = m.parameters.length - 1; index >= 0; index--) {
                    const p = m.parameters[index];
                    const defaults = m.defaults && m.defaults.find(x => x.key === p.in);
                    p.required = !p.properties || p.properties.some(p => p.required && (!defaults || !defaults.value.includes(p.name)));
                    p.required = p.required ? p.required : !m.parameters.slice(index).every(p => !p.required);
                }
                result.push(m);
            });
            return result;
        }, []);
        return methods;
    }
}
exports.Method = Method;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Param = void 0;
const tslib_1 = __webpack_require__(0);
const property_1 = __webpack_require__(5);
const generator_1 = __webpack_require__(2);
const lodash_1 = tslib_1.__importDefault(__webpack_require__(1));
class Param {
    constructor(data) {
        Object.assign(this, data);
        this.typeName = data.type;
        this.referenced = data.in === 'body';
        this.passable = data.in !== 'path';
        this.description = this.description || `The http request ${data.in} parameters.`;
    }
    static from(method, params, config) {
        const { ignores } = config;
        if (ignores) {
            params = params.filter(x => !(x.in in ignores && ignores[x.in].includes(x.name)));
        }
        let result = [];
        const groupedParams = lodash_1.default.groupBy(params, 'in');
        const parameters = Object.keys(groupedParams).reduce((r, key) => {
            if (key === 'path') {
                const paths = groupedParams[key];
                result = paths.map(p => new Param({ ...p, type: generator_1.Generator.getType(p, config) }));
            }
            else if (key === 'body') {
                const p = groupedParams[key][0];
                r[key] = new Param({ name: key, in: key, type: generator_1.Generator.getType(p, config) });
            }
            else {
                const properties = groupedParams[key].map(v => new property_1.Property(v, config));
                const type = config.rename.parameter({ method: method.name, type: key });
                r[key] = new Param({ name: key, in: key, type, properties });
            }
            return r;
        }, {});
        const header = new Param({ name: 'header', type: 'object', in: 'header', properties: [] });
        parameters.header = parameters.header || header;
        // sort params
        ['query', 'body', 'header'].filter(x => x in parameters).forEach(key => result.push(parameters[key]));
        return result;
    }
}
exports.Param = Param;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
const tslib_1 = __webpack_require__(0);
const path_1 = tslib_1.__importDefault(__webpack_require__(3));
const lodash_1 = tslib_1.__importDefault(__webpack_require__(1));
exports.defaultConfig = {
    destination: './apis',
    injection: {
        module: 'mp-inject',
        injectable: 'injectable',
        inject: 'inject',
        http: "'http'",
    },
    rename: {
        method: ({ path, method }) => lodash_1.default.camelCase([method, ...path.split('/')].join('_')),
        parameter: ({ method, type }) => lodash_1.default.upperFirst(method) + lodash_1.default.upperFirst(type),
        response: ({ type }) => {
            const sysBaseTypes = ['void', 'string', 'number', 'boolean', 'object'];
            const isSysType = sysBaseTypes.some(t => t === type || `${t}[]` === type || `Array<${t}>` === type);
            return isSysType ? type : `$Required<${type}>`;
        },
        file: ({ name }) => `${name}-api.ts`,
        class: ({ name }) => lodash_1.default.upperFirst(lodash_1.default.camelCase(name)) + 'API',
    },
    templates: {
        type: path_1.default.join(__dirname, 'templates/type.mustache'),
        index: path_1.default.join(__dirname, 'templates/index.mustache'),
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