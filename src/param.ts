import { Property } from './property';
import { Method } from './method';
import { IConfig } from './config';
import { Generator } from './generator';
import _ from 'lodash';
import { ISwaggerPathParameter } from './swagger';

export class Param {
    name: string;
    type: string;
    properties: Property[]
    constructor(data: { name: string, type: string, properties?: Property[] }) {
        this.name = data.name;
        this.type = data.type;
        this.properties = data.properties;
    }

    static from(method: Method, params: ISwaggerPathParameter[], config: IConfig) {
        const { ignores } = config;
        if (ignores) {
            params = params.filter(x => !(x.in in ignores && ignores[x.in].includes(x.name)));
        }
        const groupedParams = _.groupBy(params, 'in');
        const result = Object.keys(groupedParams).reduce((result: Record<string, Param>, key) => {
            if (key === 'body') {
                const p = groupedParams[key][0];
                result[key] = new Param({ name: key, type: Generator.getType(p, config) });
            } else {
                const properties = groupedParams[key].map(v => new Property(v, config));
                const type = config.rename.parameterType({ method: method.name, type: key });
                result[key] = new Param({ name: key, type, properties });
            }
            return result;
        }, {});
        return ['query', 'body', 'header'].filter(x => x in result).map(key => result[key]);
    }
}