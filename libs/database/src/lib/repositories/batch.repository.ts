/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BatchRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async setBatchesInactive(batchIds: string[]): Promise<{ count: number }> {
    return this.prismaService.batch.updateMany({
      where: {
        id: {
          in: batchIds,
        },
      },
      data: {
        active: false,
      },
    });
  }
}
