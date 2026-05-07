/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { RfnboType } from '@h2-trust/domain';
import { PrismaService } from '../prisma.service';
import { wrapPrismaError } from './prisma-error.wrapper';

@Injectable()
export class BatchRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async setBatchesInactive(batchIds: string[]): Promise<{ count: number }> {
    try {
      return await this.prismaService.batch.updateMany({
        where: { id: { in: batchIds } },
        data: { active: false },
      });
    } catch (error) {
      wrapPrismaError(error);
    }
  }

  async setRfnboStatus(batchId: string, rfnboType: RfnboType): Promise<{ id: string; batchId: string }> {
    try {
      return await this.prismaService.batchDetails.update({
        where: { batchId: batchId },
        data: {
          qualityDetails: {
            update: { rfnboType },
          },
        },
      });
    } catch (error) {
      wrapPrismaError(error);
    }
  }
}
