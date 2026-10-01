/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiPaginatedResponse = <TModel extends Type<unknown>>(model: TModel) =>
  applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: `Paginated response with ${model.name} items`,
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            description: `Array of ${model.name}`,
            items: {
              $ref: getSchemaPath(model),
            },
          },
          totalItems: {
            type: 'number',
            example: 42,
          },
          currentPage: {
            type: 'number',
            example: 1,
          },
        },
        required: ['data', 'totalItems', 'currentPage'],
      },
    }),
  );
