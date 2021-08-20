import { ISwaggerDefinitionProperty } from './swagger';
import { IConfig } from './config';
import { Generator } from './generator';
import { Definition } from 'definition';


export class Property {
    name: string;
    type: string;
    description: string;
    default: any;
    example: string;
    deprecated: boolean;
    required: boolean;
    generic: boolean;
    isArray: boolean;
    otherType: boolean;
    constructor(data: ISwaggerDefinitionProperty & { name: string, default?: any, required?: any }, config: IConfig, defs: Definition[]) {
        this.name = data.name;
        this.type = Generator.getType(data, config, defs);
        this.description = data.description;
        this.default = data.default;
        this.example = data.example;
        this.isArray = data.type === 'array';
        // this.deprecated = data.deprecated;
        this.required = data.required;
        this.generic = false;
        this.otherType = !!(data.$ref || data.type === 'array' && data.items.$ref);
    }
}