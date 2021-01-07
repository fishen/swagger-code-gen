import path from 'path';
import _ from 'lodash';

export interface IConfig {
    /**
     * Code generation directory
     * @default ./apis
     */
    destination?: string;
    /**
     * Naming convention
     */
    rename?: Partial<Record<'method' | 'parameter' | 'response' | 'file', (...args: any) => string>>;
    /**
     * Code template files
     */
    templates?: Partial<Record<'type' | 'index', string>>;
    /**
     * The items you want to ignore
     */
    ignores?: Partial<Record<'definitions' | 'path' | 'body' | 'header' | 'query', string[]>>;
    /**
     * The modules you want to import
     */
    imports?: string[];
    /**
     * The configuration name
     */
    name?: string;
    /**
     * The OpenAPI specification(JSON) 's resource url.
     * @example https://petstore.swagger.io/v2/swagger.json"
     */
    source?: string;
    /**
     * The http request host, if the value is false, no host will be added to the url
     * @example petstore.swagger.io
     */
    host?: string | false;
    /**
     * The http request scheme
     * @example https
     */
    scheme?: string;
    /**
     * The system generic types
     */
    systemGenericTypes?: string[];
    /**
     * The type formatter
     */
    typeFormatter?: (t: string) => string;
    /**
     * Custom type mappings
     */
    typeMappings?: Record<string, string>;
    /**
     * Whether to enable the secure property name, the property name will wrapped with double quotes if enabled.
     */
    securePropertyName?: boolean;
}

export const defaultConfig: IConfig = {
    destination: './apis',
    rename: {
        method({ path, method }) {
            this.methods = this.methods || Object.create(null);
            let name = _.camelCase([method, ...path.split('/')].join('_'));
            let index = 1;
            const origin = name;
            while (name in this.methods) {
                name = origin + index;
                index++;
            }
            this.methods[name] = true;
            return name;
        },
        parameter: ({ method, type }) => _.upperFirst(method) + _.upperFirst(type),
        response: ({ type }) => {
            const sysBaseTypes = ['void', 'string', 'number', 'boolean', 'object'];
            const isSysType = sysBaseTypes.some(t => t === type || `${t}[]` === type || `Array<${t}>` === type);
            return isSysType ? type : `$Required<${type}>`;
        },
        file: ({ name }) => `${name}-api.ts`,
    },
    templates: {
        type: path.join(__dirname, 'templates/type.mustache'),
        index: path.join(__dirname, 'templates/index.mustache'),
    },
    systemGenericTypes: ['Set', 'Map', 'WeakMap', 'WeakSet', 'Array', 'Record', 'KeyValue'],
    typeFormatter: ((t: string) => t),
    typeMappings: {
        "integer": "number",
        "List": "Array",
        "int": "number",
        "Map": "Record",
        "bigdecimal": "number",
        "long": "number",
        "ref": "number",
        "Void": "void",
        "double": 'number',
    },
}