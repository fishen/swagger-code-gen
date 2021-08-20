import { Property } from './property';
import { IConfig } from './config';
import { Generator } from './generator';
import { ISwagger, ISwaggerDefinition } from './swagger';
import _ from 'lodash';

export class Definition {
    title: string;
    name: string;
    basePath: string;
    host: string;
    properties?: Property[];
    constructor(data: ISwaggerDefinition, config: IConfig) {
        this.title = data.title;
        this.name=Generator.getType({ type: this.title }, config, []);
        if (data.properties) {
            this.properties = Object.keys(data.properties).map((name) => new Property({ ...data.properties[name], name }, config, []))
            this.properties.forEach(p => p.required = _.includes(data.required, p.name));
        }
    }

    static parse(swagger: ISwagger, config: IConfig) {
        const ignoreds = config.ignores && config.ignores.definitions;
        return Object.keys(swagger.definitions)
            .filter(title => !ignoreds || !ignoreds.includes(title))
            .map((title) => new Definition({ ...swagger.definitions[title], title }, config));
    }
}