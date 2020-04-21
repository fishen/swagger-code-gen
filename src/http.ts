export interface IHttp {
    request(options: {
        url: string,
        method: string,
        query?: Record<string, any>,
        body?: Record<string, any>,
        header?: Record<string, any>,
    }): Promise<any>;
}