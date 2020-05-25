import { Property } from './property';
import { Method } from './method';
import { IConfig } from './config';
import { Generator } from './generator';
import _ from 'lodash';
import { ISwaggerPathParameter, ParamType } from './swagger';

type Required<T> = {
    [P in keyof T]-?: Required<T[P]>;
};

export class Param {
    name: string;
    type: string;
    in: ParamType;
    properties: Property[];
    typeName: string;
    referenced: boolean;
    required?: boolean;
    description?: string;
    passable: boolean;
    constructor(data: Partial<Param>) {
        Object.assign(this, data);
        this.typeName = data.type;
        this.referenced = data.in === 'body';
        this.passable = data.in !== 'path';
        this.description = this.description || `The http request ${data.in} parameters.`;
    }

    static from(method: Method, params: ISwaggerPathParameter[], config: IConfig) {
        const { ignores } = config;
        if (ignores) {
            params = params.filter(x => !(x.in in ignores && ignores[x.in].includes(x.name)));
        }
        let result: Param[] = [];
        const groupedParams = _.groupBy(params, 'in');
        const parameters = Object.keys(groupedParams).reduce((r: Record<string, Param>, key) => {
            if (key === 'path') {
                const paths = groupedParams[key];
                result = paths.map(p => new Param({ ...p, type: Generator.getType(p, config) }));
            } else if (key === 'body') {
                const p = groupedParams[key][0];
                r[key] = new Param({ name: key, in: key, type: Generator.getType(p, config) });
            } else {
                const properties = groupedParams[key].map(v => new Property(v, config));
                const type = config.rename.parameter({ method: method.name, type: key });
                r[key] = new Param({ name: key, in: key as any, type, properties });
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