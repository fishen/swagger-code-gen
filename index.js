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

module.exports = require("lodash");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Generator = void 0;
const fs_extra_1 = __importDefault(__webpack_require__(3));
const mustache_1 = __importDefault(__webpack_require__(6));
const lodash_1 = __importDefault(__webpack_require__(0));
const node_fetch_1 = __importDefault(__webpack_require__(7));
const path_1 = __importDefault(__webpack_require__(2));
const definition_1 = __webpack_require__(8);
const method_1 = __webpack_require__(9);
class Generator {
    constructor(config) {
        this.genericTypes = new Map();
        this.config = config;
    }
    static render(view, template, filename, config) {
        const content = mustache_1.default.render(fs_extra_1.default.readFileSync(template, 'utf-8'), view);
        const destination = path_1.default.join(config.destination, filename);
        return fs_extra_1.default.ensureFile(destination).then(() => fs_extra_1.default.writeFile(destination, content));
    }
    static getType(item, config, definitions) {
        if (!item)
            return 'void';
        const { type, $ref, items, schema } = item;
        if (schema) {
            return Generator.getType(schema, config, definitions);
        }
        else if (type in config.typeMappings) {
            return config.typeMappings[type];
        }
        else if ($ref) {
            return Generator.getType({ type: $ref.replace('#/definitions/', '') }, config, definitions);
        }
        else if (type === 'array') {
            return `${Generator.getType(items, config, definitions)}[]`;
        }
        else if (/«.+»$/.test(type)) {
            const start = type.indexOf('«');
            const end = type.lastIndexOf('»');
            const genericType = type.substr(0, start);
            const genericArgType = type.substring(start + 1, end);
            let genericArgTypes = [];
            if (/«.+»$/.test(genericArgType)) {
                genericArgTypes = [Generator.getType({ type: genericArgType }, config, definitions)];
            }
            else {
                if (!definitions.some(d => d.name === config.typeFormatter(genericArgType))) {
                    genericArgTypes = genericArgType.split(',').map(type => Generator.getType({ type }, config, definitions));
                }
                else {
                    genericArgTypes = [config.typeFormatter(genericArgType)];
                }
            }
            const genericTypes = genericType.split(',')
                .map(t => t.trim())
                .filter(x => x)
                .map(type => Generator.getType({ type }, config, definitions))
                .join(', ');
            return `${genericTypes}<${genericArgTypes.join(', ')}>`;
        }
        else if (type.endsWith('[]')) {
            const arrType = type.substr(0, type.indexOf('[]')).trim();
            return `${Generator.getType({ type: arrType }, config, definitions)}[]`;
        }
        return config.typeFormatter(type);
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
                    def.genericProperties = lodash_1.default.differenceWith(d.properties, def.properties, (x, y) => x.name === y.name && x.type === y.type).map(x => x.name);
                    def.properties.filter(d => def.genericProperties.includes(d.name)).forEach(p => p.generic = true);
                }
                else {
                    let genericProperties = d.properties.filter(d => d.otherType).map(p => p.name);
                    if (!genericProperties.length) {
                        genericProperties = d.properties.filter(p => p.type === d.genericType).map(p => p.name).slice(0, 1);
                    }
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
/* 2 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("fs-extra");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Property = void 0;
const generator_1 = __webpack_require__(1);
class Property {
    constructor(data, config, defs) {
        this.name = data.name;
        this.type = generator_1.Generator.getType(data, config, defs);
        this.description = data.description;
        this.default = data.default;
        this.example = data.example;
        this.isArray = data.type === 'array';
        // this.deprecated = data.deprecated;
        this.required = data.required;
        this.generic = false;
        this.otherType = !!(data.$ref || data.type === 'array' && data.items.$ref);
    }
}
exports.Property = Property;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const path_1 = __importDefault(__webpack_require__(2));
const lodash_1 = __importDefault(__webpack_require__(0));
const generator_1 = __webpack_require__(1);
const fs_extra_1 = __importDefault(__webpack_require__(3));
const config_1 = __webpack_require__(11);
function merge(obj, ...args) {
    function customizer(objValue, srcValue) {
        if (lodash_1.default.isArray(objValue)) {
            return objValue.concat(srcValue);
        }
    }
    return lodash_1.default.mergeWith(obj, ...args, customizer);
}
function generate(config) {
    const configurations = Object.keys(config)
        .filter(name => name !== 'common')
        .map(name => merge({}, config_1.defaultConfig, config.common, config[name], { name }));
    const promises = configurations.map(cfg => new generator_1.Generator(cfg).generate());
    return Promise.all(promises).then(() => {
        const cfg = merge(config_1.defaultConfig, config.common);
        fs_extra_1.default.copyFileSync(path_1.default.resolve(__dirname, './templates/config.ts'), path_1.default.join(cfg.destination, 'config.ts'));
    }).catch(console.error);
}
exports.generate = generate;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("mustache");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("node-fetch");

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Definition = void 0;
const property_1 = __webpack_require__(4);
const generator_1 = __webpack_require__(1);
const lodash_1 = __importDefault(__webpack_require__(0));
class Definition {
    constructor(data, config) {
        this.title = data.title;
        this.type = generator_1.Generator.getType({ type: this.title }, config, []);
        this.generic = /<.+>$/.test(this.type);
        if (this.generic) {
            this.genericType = this.type.substring(this.type.indexOf('<') + 1, this.type.length - 1);
        }
        this.name = this.generic ? this.type.substr(0, this.type.indexOf('<')) : this.type;
        if (data.properties) {
            this.properties = Object.keys(data.properties).map((name) => new property_1.Property({ ...data.properties[name], name }, config, []));
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
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Method = void 0;
const param_1 = __webpack_require__(10);
const lodash_1 = __importDefault(__webpack_require__(0));
const generator_1 = __webpack_require__(1);
class Method {
    constructor(data, config, swagger, definitions) {
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
        this.response = generator_1.Generator.getType(resSchema, config, definitions);
        if (lodash_1.default.isFunction(config.rename.response)) {
            this.response = config.rename.response({ type: this.response });
        }
        this.name = config.rename.method(this);
        this.parameters = param_1.Param.from(this, data.parameters, config, definitions);
        this.parameters.filter(p => p.in === 'path')
            .map(p => new RegExp(`\{(${p.name})\}`, 'g'))
            .forEach(reg => this.url = this.url.replace(reg, "${$1}"));
    }
    static parse(swagger, definitions, config) {
        const methods = Object.keys(swagger.paths)
            .filter(key => !config.ignores || !config.ignores.path || !(config.ignores.path.includes(key)))
            .reduce((result, path) => {
            const value = swagger.paths[path];
            Object.keys(value).map(method => {
                const m = new Method({ method, path, ...value[method] }, config, swagger, definitions);
                m.parameters.forEach((param) => {
                    if (param.in === 'body') {
                        const d = definitions.find(d => d.type === param.type);
                        param.properties = d && d.properties;
                    }
                });
                for (let index = m.parameters.length - 1; index >= 0; index--) {
                    const p = m.parameters[index];
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
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Param = void 0;
const property_1 = __webpack_require__(4);
const generator_1 = __webpack_require__(1);
const lodash_1 = __importDefault(__webpack_require__(0));
class Param {
    constructor(data) {
        Object.assign(this, data);
        this.typeName = data.type;
        this.referenced = data.in === 'body';
        this.passable = data.in !== 'path';
        this.description = this.description || `The http request ${data.in} parameters.`;
    }
    static from(method, params, config, definitions) {
        const { ignores } = config;
        if (ignores) {
            params = params.filter(x => !(x.in in ignores && ignores[x.in].includes(x.name)));
        }
        let result = [];
        const groupedParams = lodash_1.default.groupBy(params, 'in');
        const parameters = Object.keys(groupedParams).reduce((r, key) => {
            if (key === 'path') {
                const paths = groupedParams[key];
                result = paths.map(p => new Param({ ...p, type: generator_1.Generator.getType(p, config, definitions) }));
            }
            else if (key === 'body') {
                const p = groupedParams[key][0];
                r[key] = new Param({ name: key, in: key, type: generator_1.Generator.getType(p, config, definitions) });
            }
            else {
                const properties = groupedParams[key].map(v => new property_1.Property(v, config, definitions)).reduce((result, p) => {
                    if (!result.some(x => p.name === x.name)) {
                        result.push(p);
                    }
                    return result;
                }, []);
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
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
const path_1 = __importDefault(__webpack_require__(2));
const lodash_1 = __importDefault(__webpack_require__(0));
exports.defaultConfig = {
    destination: './apis',
    rename: {
        method({ path, method }) {
            this.methods = this.methods || Object.create(null);
            let name = lodash_1.default.camelCase([method, ...path.split('/')].join('_'));
            let index = 1;
            const origin = name;
            while (name in this.methods) {
                name = origin + index;
                index++;
            }
            this.methods[name] = true;
            return name;
        },
        parameter: ({ method, type }) => lodash_1.default.upperFirst(method) + lodash_1.default.upperFirst(type),
        response: ({ type }) => {
            const sysBaseTypes = ['void', 'string', 'number', 'boolean', 'object'];
            const isSysType = sysBaseTypes.some(t => t === type || `${t}[]` === type || `Array<${t}>` === type);
            return isSysType ? type : `$Required<${type}>`;
        },
        file: ({ name }) => `${name}-api.ts`,
    },
    templates: {
        type: path_1.default.join(__dirname, 'templates/type.mustache'),
        index: path_1.default.join(__dirname, 'templates/index.mustache'),
    },
    systemGenericTypes: ['Map', 'WeakMap', 'WeakSet', 'Array', 'Record', 'KeyValue'],
    typeFormatter: ((t) => t),
    typeMappings: {
        "integer": "number",
        "List": "Array",
        'Set': "Array",
        "int": "number",
        "Map": "Record",
        "bigdecimal": "number",
        "long": "number",
        "ref": "number",
        "Void": "void",
        "double": 'number',
        "byte": "number",
        "LinkedList": "Array"
    },
};


/***/ })
/******/ ])));
//# sourceMappingURL=index.js.map