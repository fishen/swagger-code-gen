import { Property } from './property';
import { IConfig } from './config';
import { Generator } from './generator';
import { ISwagger, ISwaggerDefinition } from './swagger';
import _ from 'lodash';

export class Definition {
    title: string;
    type: string;
    generic: boolean;
    name: string;
    basePath: string;
    host: string;
    properties?: Property[];
    genericProperties?: string[];
    constructor(data: ISwaggerDefinition & { title: string }, config: IConfig) {
        this.title = data.title;
        this.type = Generator.getType({ type: this.title }, config);
        this.generic = /<.+>$/.test(this.type);
        this.name = this.generic ? this.type.substr(0, this.type.indexOf('<')) : this.type;
        if (data.properties) {
            this.properties = Object.keys(data.properties).map((name) => new Property({ ...data.properties[name], name }, config))
            this.properties.forEach(p => p.required = _.includes(data.required, p.name));
        }
    }

    static parse(swagger: ISwagger, config: IConfig) {
        const ignoreds = config.ignores.definitions;
        return Object.keys(swagger.definitions)
            .filter(title => !ignoreds || !ignoreds.includes(title))
            .map((title) => new Definition({ ...swagger.definitions[title], title }, config));
    }
}