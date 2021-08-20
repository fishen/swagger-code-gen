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
            return config.typeFormatter(type).replace(/[«,»]/g, '_')
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
                return {
                    ...json,
                    methods: Method.parse({ ...json }, definitions, this.config),
                    definitions,
                    config: this.config,
                }
            })
            .then(view => Generator.render(view, templates.type, rename.file({ name: this.config.name }), this.config))
    }
}