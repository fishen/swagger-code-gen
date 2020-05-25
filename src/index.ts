import path from 'path';
import _ from 'lodash';
import { Generator } from './generator';
import { IHttp } from './http';
import fs from 'fs-extra';
import { IConfig, defaultConfig } from './config';

export function generate(config: Record<string, IConfig>) {
    const configurations = Object.keys(config)
        .filter(name => name !== 'common')
        .map(name => _.merge({}, defaultConfig, config.common, config[name], { name }));
    const promises = configurations.map(cfg => new Generator(cfg).generate());
    return Promise.all(promises).then(() => {
        const cfg = _.merge(defaultConfig, config.common);
        const apis = configurations.map(cfg => ({
            module: path.basename(cfg.rename.file(cfg), '.ts'),
            classname: cfg.rename.class(cfg),
        }));
        fs.copyFileSync(path.resolve(__dirname, './templates/type.ts'), path.join(cfg.destination, 'type.ts'))
        return Generator.render({ apis }, cfg.templates.index, 'index.ts', cfg)
    }).catch(console.error);
}

export type {
    IConfig,
    IHttp
}