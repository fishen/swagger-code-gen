
export interface ISwaggerInfo {
    version: string;
    title: string;
}
export interface ISwaggerDefinitionProperty {
    example?: string;
    format?: string;
    description?: string;
    type?: string;
    $ref?: string;
    items?: ISwaggerDefinitionProperty;
}
export interface ISwaggerDefinition {
    properties: Record<string, ISwaggerDefinitionProperty>;
    required?: string[];
    type: string;
    title: string;
    additionalProperties?: Record<'type', any>
}
export interface ISwaggerPathParameter {
    default: any;
    description: string;
    in: 'header' | 'body' | 'query';
    name: string;
    required: boolean;
    type: string;
}
export interface ISwaggerPathResponse {
    description: string;
    schema?: ISwaggerDefinitionProperty;
}
export interface ISwaggerPath {
    consumes: string[];
    operationId: string;
    parameters: ISwaggerPathParameter[];
    produces: string[];
    responses: Record<number, ISwaggerPathResponse>;
    summary: string;
    tags: string[];
    deprecated?: boolean;
}
export interface ISwaggerTag {
    name: string;
    description: string;
}
export interface ISwagger {
    basePath: string;
    definitions: Record<string, ISwaggerDefinition>;
    host: string;
    info: ISwaggerInfo;
    paths: Record<string, Record<string, ISwaggerPath>>
    swagger: string;
    tags: ISwaggerTag[];
}