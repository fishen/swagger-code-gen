import { Param } from './param';
import { IConfig } from './config';
import _ from 'lodash';
import { Generator } from './generator';
import { ISwagger, ISwaggerPath } from './swagger';

export class Method {
    method: string;
    path: string;
    url: string;
    deprecated: boolean;
    operationId: string;
    summary: string;
    tags: string[];
    name: string;
    parameters: Param[];
    response: string;
    constructor(data: ISwaggerPath & { path: string, method: string }, config: IConfig, swagger: ISwagger) {
        this.method = data.method;
        this.path = data.path;
        this.url = `${swagger.basePath}/${data.path}`.replace(/\/+/g, '/');
        this.deprecated = data.deprecated;
        this.operationId = data.operationId;
        this.summary = data.summary;
        this.tags = data.tags;
        this.response = Generator.getType(data.responses[200].schema, config);
        if (_.isFunction(config.rename.responseType)) {
            this.response = config.rename.responseType({ type: this.response });
        }
        this.name = config.rename.method(this);
        this.parameters = Param.from(this, data.parameters, config);
    }
    static parse(swagger: ISwagger, config: IConfig) {
        const methods = Object.keys(swagger.paths)
            .reduce((result, path) => {
                const value = swagger.paths[path];
                Object.keys(value)
                    .map(method => result.push(new Method({ method, path, ...value[method] }, config, swagger)));
                return result;
            }, []);
        return methods;
    }
}
