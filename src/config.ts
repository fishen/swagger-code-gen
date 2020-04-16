import path from 'path';
import _ from 'lodash';

export interface IConfig {
    injection?: Record<string, string>;
    destination?: string;
    defaults?: Partial<Record<'body' | 'header' | 'query', string[]>>;
    rename?: Partial<Record<'method' | 'parameterType' | 'responseType', (...args: any) => string>>;
    templates?: Partial<Record<'type' | 'index', string>>;
    ignores?: Partial<Record<'definitions' | 'body' | 'header' | 'query', string[]>>;
    imports?: Record<string, string>;
    filename?: (args: { name: string }) => string;
    classname?: (args: { name: string }) => string;
    name?: string;
    source?: string;
    systemGenericTypes?: string[];
    typeMappings?: Record<string, string>;
}

export const defaultConfig: IConfig = {
    destination: '.',
    injection: {
        module: 'mp-inject',
        injectable: 'injectable',
        inject: 'inject',
        http: "'http'",
    },
    rename: {
        method: ({ path, method }) => _.camelCase([method, ...path.split('/')].join('_')),
        parameterType: ({ method, type }) => _.upperFirst(method) + _.upperFirst(type),
    },
    templates: {
        type: './templates/type.mustache',
        index: './templates/index.mustache',
    },
    filename: ({ name }) => `${name}-api.ts`,
    classname: ({ name }) => _.upperFirst(_.camelCase(name)) + 'API',
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
}