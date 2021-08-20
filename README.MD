

Automatically generate TypeScript client API according to the defined OpenAPI specification.
>Currently only supports swagger 2.0 version
# Installation
```sh
npm install -D swagger-code-generate
```
# Getting started
```js
// gen-apis.js
// excute "node gen-apis.js" to get result

const { generate } = require('swagger-code-generate');

generate({
    common: {
        // global common configuration
    },
    swagger: {
        source: "https://generator.swagger.io/api/swagger.json",
    },
    petstore: {
        source: "https://petstore.swagger.io/v2/swagger.json",
    }
})
```
# Generation Result
```ts
// apis/swagger-api.ts

//.......type defenations.......

/**
 * Downloads a pre-generated file
 * @param fileId The http request path parameters.
 * @param header The http request header parameters.
 */
export function getGenDownloadFileId(fileId: string, header?: object, ): Promise<string> {
    const url = `/api/gen/download/${fileId}`;
    return request({ url, method: 'get', header, });
}

/**
 * Returns options for a client library
 * @param language The target language for the client library
 * @param header The http request header parameters.
 */
export function getGenClientsLanguage(language: string, header?: object, ): Promise<object> {
    const url = `/api/gen/clients/${language}`;
    return request({ url, method: 'get', header, });
}

/**
 * Generates a client library
 * @param language The target language for the client library
 * @param body The http request body parameters.
 * @param header The http request header parameters.
 */
export function postGenClientsLanguage(language: string, body?: GeneratorInput, header?: object, ): Promise<$Required<ResponseCode>> {
    const url = `/api/gen/clients/${language}`;
    return request({ url, method: 'post', body, header, });
}

/**
 * Returns options for a server framework
 * @param framework The target language for the server framework
 * @param header The http request header parameters.
 */
export function getGenServersFramework(framework: string, header?: object, ): Promise<object> {
    const url = `/api/gen/servers/${framework}`;
    return request({ url, method: 'get', header, });
}

/**
 * Generates a server library
 * @param framework framework
 * @param body The http request body parameters.
 * @param header The http request header parameters.
 */
export function postGenServersFramework(framework: string, body?: GeneratorInput, header?: object, ): Promise<$Required<ResponseCode>> {
    const url = `/api/gen/servers/${framework}`;
    return request({ url, method: 'post', body, header, });
}

/**
 * Gets languages supported by the client generator
 * @param header The http request header parameters.
 */
export function getGenClients(header?: object, ): Promise<string[]> {
    const url = `/api/gen/clients`;
    return request({ url, method: 'get', header, });
}

/**
 * Gets languages supported by the server generator
 * @param header The http request header parameters.
 */
export function getGenServers(header?: object, ): Promise<string[]> {
    const url = `/api/gen/servers`;
    return request({ url, method: 'get', header, });
}
```
# Configuration
```ts
{
    common:{},
    api1Name:{},
    api2Name:{}
}
```
```ts
export interface IConfig {
    /**
     * Code generation directory
     * @default './apis'
     */
    destination?: string;
    /**
     * Naming convention
     */
    rename?: Partial<Record<'method' | 'parameter' | 'response' | 'file', (...args: any) => string>>;
    /**
     * Code template files
     */
    templates?: Partial<Record<'type', string>>;
    /**
     * The items want to ignore
     */
    ignores?: Partial<Record<'definitions' | 'path' | 'body' | 'header' | 'query', string[]>>;
    /**
     * The modules want to import
     */
    imports?: string[];
    /**
     * The configuration name, default is the configuration key name
     */
    name?: string;
    /**
     * The OpenAPI specification(JSON) 's resource url.
     * @example 'https://petstore.swagger.io/v2/swagger.json'
     */
    source?: string;
    /**
     * The http request host, if the value is false, no host will be added to the url
     * @example 'petstore.swagger.io'
     */
    host?: string | false;
    /**
     * The http request scheme
     * @example https
     */
    scheme?: string;
    /**
     * Custom type mappings
     * @example {'integer':'number'}
     */
    typeMappings?: Record<string, string>;
    /**
     * Whether to enable the secure property name, the property name will wrapped with double quotes if enabled.
     */
    securePropertyName?: boolean;
}
```
