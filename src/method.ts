import { Param } from './param';
import { IConfig } from './config';
import _ from 'lodash';
import { Generator } from './generator';
import { ISwagger, ISwaggerPath } from './swagger';
import { Definition } from './definition';

export class Method {
    method: string;
    path: string;
    url: string;
    deprecated: boolean;
    operationId: string;
    summary: string;
    tags?: string[];
    name: string;
    parameters: Param[];
    defaults?: { key: string, value: string[] }[];
    response: string;
    constructor(data: ISwaggerPath & { path: string, method: string }, config: IConfig, swagger: ISwagger) {
        this.method = data.method;
        this.path = data.path;
        this.url = `${swagger.basePath}/${data.path}`.replace(/\/+/g, '/');
        if (config.host !== false) {
            let { host, scheme } = config;
            host = _.isString(host) ? host : swagger.host;
            scheme = _.isString(scheme) ? scheme : (swagger.schemes && swagger.schemes[0]) || 'https';
            this.url = host && scheme ? `${scheme}://${host}${this.url}` : this.url;
        }
        this.deprecated = data.deprecated;
        this.operationId = data.operationId;
        this.summary = data.summary;
        this.tags = data.tags;
        const resSchema = data.responses[200] && data.responses[200].schema;
        this.response = Generator.getType(resSchema, config);
        if (_.isFunction(config.rename.response)) {
            this.response = config.rename.response({ type: this.response });
        }
        this.name = config.rename.method(this);
        this.parameters = Param.from(this, data.parameters, config);
        this.parameters.filter(p => p.in === 'path')
            .map(p => new RegExp(`\{(${p.name})\}`, 'g'))
            .forEach(reg => this.url = this.url.replace(reg, "${$1}"));
    }
    setDefault(param: Param, defaults: string[]) {
        if (!Array.isArray(param.properties)) return;
        const defaultNames = param.properties.filter(p => defaults.includes(p.name)).map(p => p.name);
        if (!defaultNames.length) return;
        param.type = `$Optional<${param.type}, ${defaultNames.map(p => `'${p}'`).join(' | ')}>`;
        this.defaults = this.defaults || [];
        this.defaults.push({ key: param.in, value: defaultNames });
    }
    static parse(swagger: ISwagger, definitions: Definition[], config: IConfig): Method[] {
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
                    })
                    for (let index = m.parameters.length - 1; index >= 0; index--) {
                        const p = m.parameters[index];
                        const defaults = m.defaults && m.defaults.find(x => x.key === p.in);
                        p.required = !p.properties || p.properties.some(p => p.required && (!defaults || !defaults.value.includes(p.name)));
                        p.required = p.required ? p.required : !m.parameters.slice(index).every(p => !p.required);
                    }
                    result.push(m);
                });
                return result;
            }, [] as Method[]);
        return methods;

    }
}
