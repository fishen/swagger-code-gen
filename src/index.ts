import path from 'path';
import _ from 'lodash';
import { Generator } from './generator';
import fs from 'fs-extra';
import { IConfig, defaultConfig } from './config';

function merge(obj: any, ...args: any) {
    function customizer(objValue: any, srcValue: any) {
        if (_.isArray(objValue)) {
            return objValue.concat(srcValue);
        }
    }
    return _.mergeWith(obj, ...args, customizer);
}

export function generate(config: Record<string, IConfig>) {
    const configurations = Object.keys(config)
        .filter(name => name !== 'common')
        .map(name => merge({}, defaultConfig, config.common, config[name], { name }));
    const promises = configurations.map(cfg => new Generator(cfg).generate());
    const log = (name: string, func: number) => console.log(`${name}:`, `function:${func}`);
    return Promise.all(promises).then((items) => {
        const total = items.reduce((total, item) => {
            log(item.data.config.name, item.data.methods.length);
            total.func += item.data.methods.length;
            return total;
        }, { func: 0, defs: 0 });
        log('total', total.func);
        const cfg = merge(defaultConfig, config.common);
        fs.copyFileSync(path.resolve(__dirname, './templates/config.ts'), path.join(cfg.destination, 'config.ts'))
    }).catch(console.error);
}

export type {
    IConfig
}