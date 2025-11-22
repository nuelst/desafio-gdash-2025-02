import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              total: {
                type: 'number',
                example: 100,
              },
              page: {
                type: 'number',
                example: 1,
              },
              limit: {
                type: 'number',
                example: 50,
              },
            },
          },
        ],
      },
    }),
    ApiExtraModels(model),
  );
};

export const ApiStandardResponses = () => {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Requisição inválida',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: {
            type: 'array',
            items: { type: 'string' },
            example: ['validation error'],
          },
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Não autenticado',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),
  );
};

export const ApiCreatedResponseWithModel = <TModel extends Type<any>>(
  model: TModel,
  description?: string,
) => {
  return applyDecorators(
    ApiCreatedResponse({
      description: description || 'Recurso criado com sucesso',
      schema: {
        $ref: getSchemaPath(model),
      },
    }),
    ApiExtraModels(model),
  );
};

export const ApiOkResponseWithModel = <TModel extends Type<any>>(
  model: TModel,
  description?: string,
) => {
  return applyDecorators(
    ApiOkResponse({
      description: description || 'Operação realizada com sucesso',
      schema: {
        $ref: getSchemaPath(model),
      },
    }),
    ApiExtraModels(model),
  );
};

export const ApiNotFoundResponseStandard = () => {
  return ApiNotFoundResponse({
    description: 'Recurso não encontrado',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Recurso não encontrado' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  });
};

export const ApiConflictResponseStandard = () => {
  return ApiConflictResponse({
    description: 'Conflito - recurso já existe',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Recurso já existe' },
        error: { type: 'string', example: 'Conflict' },
      },
    },
  });
};
