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

    static render(view: any, template: string, filename: string, config: IConfig) {
        const content = mustache.render(fs.readFileSync(template, 'utf-8'), view);
        const destination = path.join(config.destination, filename);
        return fs.ensureFile(destination).then(() => fs.writeFile(destination, content)).then(() => ({
            data: view,
            filename,
            config
        }));
    }

    static getType(item: { type?: string, $ref?: string, items?: object, schema?: object }, config: IConfig, definitions: Definition[]): string {
        if (!item) return 'void';
        const { type, $ref, items, schema } = item;
        if (schema) {
            return Generator.getType(schema, config, definitions);
        } else if (type in config.typeMappings) {
            return config.typeMappings[type];
        } else if ($ref) {
            return Generator.getType({ type: $ref.replace('#/definitions/', '') }, config, definitions);
        } else if (type === 'array') {
            return `${Generator.getType(items, config, definitions)}[]`;
        } else if (/«.+»$/.test(type)) {
            const start = type.indexOf('«');
            const end = type.lastIndexOf('»');
            const genericType = type.substr(0, start);
            const genericArgType = type.substring(start + 1, end);
            let genericArgTypes = [];
            if (/«.+»$/.test(genericArgType)) {
                genericArgTypes = [Generator.getType({ type: genericArgType }, config, definitions)];
            } else {
                if (!definitions.some(d => d.name === config.typeFormatter(genericArgType))) {
                    genericArgTypes = genericArgType.split(',').map(type => Generator.getType({ type }, config, definitions));
                } else {
                    genericArgTypes = [config.typeFormatter(genericArgType)];
                }
            }
            const genericTypes = genericType.split(',')
                .map(t => t.trim())
                .filter(x => x)
                .map(type => Generator.getType({ type }, config, definitions))
                .join(', ');
            return `${genericTypes}<${genericArgTypes.join(', ')}>`;
        } else if (type.endsWith('[]')) {
            const arrType = type.substr(0, type.indexOf('[]')).trim();
            return `${Generator.getType({ type: arrType }, config, definitions)}[]`;
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
                            def.genericProperties = _.differenceWith(d.properties, def.properties, (x, y) => x.name === y.name && x.type === y.type).map(x => x.name);
                            def.properties.filter(d => def.genericProperties.includes(d.name)).forEach(p => p.generic = true);
                        } else {
                            let genericProperties = d.properties.filter(d => d.otherType).map(p => p.name);
                            if (!genericProperties.length) {
                                genericProperties = d.properties.filter(p => p.type === d.genericType).map(p => p.name).slice(0, 1);
                            }
                            d.properties.filter(d => genericProperties.includes(d.name)).forEach(p => p.generic = true);
                            definitions.push({ ...d, genericProperties, title: d.name, type: d.name, generic: false })
                        }
                    });
                return {
                    ...json,
                    methods: Method.parse({ ...json }, definitions, this.config),
                    definitions: definitions.filter(d => !d.generic),
                    config: this.config,
                }
            })
            .then(view => Generator.render(view, templates.type, rename.file({ name: this.config.name }), this.config))
    }
}