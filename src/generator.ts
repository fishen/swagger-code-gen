import fs from 'fs-extra';
import mustache from 'mustache';
import _ from 'lodash';
import fetch from 'node-fetch';
import path from 'path';
import { IConfig } from './config';
import { Definition } from './definition';
import { Method } from './method';

export class Generator {
    genericTypes = new Map();
    config: IConfig;
    constructor(config: IConfig) {
        this.config = config;
    }

    static render(view: object, template: string, filename: string, config: IConfig) {
        const content = mustache.render(fs.readFileSync(template, 'utf-8'), view);
        const destination = path.join(config.destination, filename);
        return fs.ensureFile(destination).then(() => fs.writeFile(destination, content));
    }

    static getType(item: { type?: string, $ref?: string, items?: object, schema?: object }, config: IConfig): string {
        if (!item) return 'void';
        const { type, $ref, items, schema } = item;
        if (schema) {
            return Generator.getType(schema, config);
        } else if (type in config.typeMappings) {
            return config.typeMappings[type];
        } else if ($ref) {
            return Generator.getType({ type: $ref.replace('#/definitions/', '') }, config);
        } else if (type === 'array') {
            return `${Generator.getType(items, config)}[]`;
        } else if (/«.+»$/.test(type)) {
            const start = type.indexOf('«');
            const end = type.lastIndexOf('»');
            const genericType = type.substr(0, start);
            const genericArgType = type.substring(start + 1, end);
            let genericArgTypes = [];
            if (/«.+»$/.test(genericArgType)) {
                genericArgTypes = [Generator.getType({ type: genericArgType }, config)];
            } else {
                genericArgTypes = genericArgType.split(',').map(type => Generator.getType({ type }, config));
            }
            const genericTypes = genericType.split(',')
                .map(t => t.trim())
                .filter(x => x)
                .map(type => Generator.getType({ type }, config))
                .join(', ');
            return `${genericTypes}<${genericArgTypes.join(', ')}>`;
        }
        return config.typeFormatter(type);
    }
    generate() {
        const { source, templates, rename } = this.config;
        if (!source) throw new Error("The option 'source' is required");
        return fetch(source)
            .then(res => res.json())
            .then(json => {
                const definitions = Definition.parse(json, this.config);
                definitions.filter(d => d.generic && !this.config.systemGenericTypes.includes(d.name) && d.properties)
                    .forEach(d => {
                        const def = definitions.find(x => x.title === d.name);
                        if (def) {
                            if (def.genericProperties) return;
                            const properties = d.properties.filter(p => p.otherType).map(p => p.name);
                            def.genericProperties = properties;
                            def.properties.filter(d => properties.includes(d.name)).forEach(p => p.generic = true);
                        } else {
                            const genericProperties = d.properties.filter(d => d.otherType).map(p => p.name);
                            d.properties.filter(d => genericProperties.includes(d.name)).forEach(p => p.generic = true);
                            definitions.push({ ...d, genericProperties, title: d.name, type: d.name, generic: false })
                        }
                    });
                return {
                    ...json,
                    methods: Method.parse({ ...json }, definitions, this.config),
                    definitions: definitions.filter(d => !d.generic),
                    config: this.config
                }
            })
            .then(view => Generator.render(view, templates.type, rename.file({ name: this.config.name }), this.config))
    }
}