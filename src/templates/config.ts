interface IConfig {
    /**
     * Make a HTTP request operation.
     * @param options The parameters required by the request.
     */
    request(options: {
        url: string,
        method: string,
        query?: Record<string, any>,
        body?: any,
        header?: Record<string, any>,
    }): Promise<any>
}

export default {
    request(options) {
        return Promise.reject('The [request] option is required');
    }
} as IConfig;
