import { Property } from './property';
import { Method } from './method';
import { IConfig } from './config';
import { Generator } from './generator';
import _ from 'lodash';
import { ISwaggerPathParameter } from './swagger';

type Required<T> = {
    [P in keyof T]-?: Required<T[P]>;
};

export class Param {
    name: string;
    type: string;
    in: 'body' | 'query' | 'header';
    properties: Property[];
    typeName: string;
    referenced: boolean;
    required?: boolean;
    constructor(data: { name: string, type: string, in: 'body' | 'query' | 'header', properties?: Property[] }) {
        this.name = data.name;
        this.type = data.type;
        this.typeName = data.type;
        this.properties = data.properties;
        this.in = data.in;
        this.referenced = data.in === 'body';
    }

    static from(method: Method, params: ISwaggerPathParameter[], config: IConfig) {
        const { ignores } = config;
        if (ignores) {
            params = params.filter(x => !(x.in in ignores && ignores[x.in].includes(x.name)));
        }
        const groupedParams = _.groupBy(params, 'in');
        const parameters = Object.keys(groupedParams).reduce((result: Record<string, Param>, key) => {
            if (key === 'body') {
                const p = groupedParams[key][0];
                result[key] = new Param({ name: key, in: key, type: Generator.getType(p, config) });
            } else {
                const properties = groupedParams[key].map(v => new Property(v, config));
                const type = config.rename.parameterType({ method: method.name, type: key });
                result[key] = new Param({ name: key, in: key as any, type, properties });
            }
            return result;
        }, {});
        const header = new Param({ name: 'header', type: 'object', in: 'header', properties: [] });
        parameters.header = parameters.header || header;
        const result = ['query', 'body', 'header'].filter(x => x in parameters).map(key => parameters[key]);
        return result;
    }
}