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
    defaults?: { name: string, in: string }[] = [];
    response: string;
    constructor(data: ISwaggerPath & { path: string, method: string }, config: IConfig, swagger: ISwagger) {
        this.method = data.method;
        this.path = data.path;
        this.url = `${swagger.basePath}/${data.path}`.replace(/\/+/g, '/');
        this.deprecated = data.deprecated;
        this.operationId = data.operationId;
        this.summary = data.summary;
        this.tags = data.tags;
        this.response = `$Required<${Generator.getType(data.responses[200].schema, config)}>`;
        if (_.isFunction(config.rename.responseType)) {
            this.response = config.rename.responseType({ type: this.response });
        }
        this.name = config.rename.method(this);
        this.parameters = Param.from(this, data.parameters, config);
    }
    setDefault(param: Param, properties: { name: string }[], defaults: string[]) {
        if (!Array.isArray(properties)) return;
        const names = properties.filter(p => defaults.includes(p.name)).map(p => p.name);
        if (!names.length) return;
        param.type = `$Optional<${param.type}, ${names.map(p => `'${p}'`).join(' | ')}>`;
        this.defaults.push(...names.map(name => ({ name, in: param.in })));
    }
    static parse(swagger: ISwagger, definitions: Definition[], config: IConfig): Method[] {
        const methods = Object.keys(swagger.paths)
            .reduce((result, path) => {
                const value = swagger.paths[path];
                Object.keys(value).map(method => {
                    const m = new Method({ method, path, ...value[method] }, config, swagger);
                    m.parameters.forEach(param => {
                        if (param.in === 'body') {
                            const d = definitions.find(d => d.type === param.type);
                            m.setDefault(param, d && d.properties, config.defaults);
                        } else {
                            m.setDefault(param, param.properties, config.defaults);
                        }
                    })
                    result.push(m);
                });
                return result;
            }, []);
        return methods;
    }
}
