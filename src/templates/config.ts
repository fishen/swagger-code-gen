interface IRequestOptions {
    url: string,
    method?: string,
    query?: Record<string, any>,
    body?: any,
    header?: Record<string, any>,
}
interface IConfig {
    /**
     * Make a HTTP request operation.
     * @param options The parameters required by the request.
     */
    request(options: IRequestOptions): Promise<any>
}

const GLOBAL_CONFIG_KEY = "__SWAGGER_CONFIG_REQUEST__";

const defaultConfig = {
    _request: null as any,
    get request(): (options: IRequestOptions) => Promise<any> {
        if (this._request) {
            return this._request;
        } else if (globalThis && GLOBAL_CONFIG_KEY in globalThis) {
            return globalThis[GLOBAL_CONFIG_KEY];
        } else {
            return () => Promise.reject('The [swagger-api#request] option is required') as Promise<any>;
        }
    },
    set request(value: (options: IRequestOptions) => Promise<any>) {
        this._request = value;
        if (globalThis) {
            globalThis[GLOBAL_CONFIG_KEY] = value;
        }
    }
}

export default defaultConfig as IConfig;
