export interface IHttp {
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
    }): Promise<any>;

    /**
     * Get the default value
     * @param name The param name
     * @param from The param source 'path','query','body','header'.
     * @param url The api url string.
     */
    getDefaultValue?(name: string, from: string, url: string): any;
}