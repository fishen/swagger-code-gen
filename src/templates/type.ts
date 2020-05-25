export type $Select<T, K> = K extends keyof T ? T[K] : T;
export type $Optional<T, K extends keyof any> = Omit<T, K> & {
    [P in Extract<K, keyof T>]?: T[P];
}
export type $Required<T> = {
    [P in keyof T]-?: $Required<T[P]>;
}
export interface IHttp {
    /**
     * Make a HTTP request operation.
     * @param options The parameters required by the request.
     */
    request(options: {
        url: string,
        method: string,
        query?: Record<string, any>,
        body?: Record<string, any>,
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
