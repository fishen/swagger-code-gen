import { ISwaggerDefinitionProperty } from './swagger';
import { IConfig } from './config';
import { Generator } from './generator';


export class Property {
    name: string;
    type: string;
    description: string;
    default: any;
    example: string;
    deprecated: boolean;
    required: boolean;
    generic: boolean;
    otherType: boolean;
    constructor(data: ISwaggerDefinitionProperty & { name: string, default?: any, required?: any }, config: IConfig) {
        this.name = data.name;
        this.type = Generator.getType(data, config);
        this.description = data.description;
        this.default = data.default;
        this.example = data.example;
        // this.deprecated = data.deprecated;
        this.required = data.required;
        this.generic = false;
        this.otherType = !!(data.$ref || data.type === 'array' && data.items.$ref);
    }
}