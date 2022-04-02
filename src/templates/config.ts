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

const global = (function () {
    if (typeof globalThis !== "undefined") {
        return globalThis;
    }
    if (typeof self !== "undefined") {
        return self;
    }
    if (typeof window !== "undefined") {
        return window;
    }
    throw new Error("unable to locate global object");
}());

const defaultConfig = {
    _request: null as any,
    get request(): (options: IRequestOptions) => Promise<any> {
        if (this._request) {
            return this._request;
        } else if (global && GLOBAL_CONFIG_KEY in global) {
            return global[GLOBAL_CONFIG_KEY];
        } else {
            return () => Promise.reject('The [swagger-api#request] option is required') as Promise<any>;
        }
    },
    set request(value: (options: IRequestOptions) => Promise<any>) {
        this._request = value;
        if (global) {
            global[GLOBAL_CONFIG_KEY] = value;
        }
    }
}

export default defaultConfig as IConfig;
