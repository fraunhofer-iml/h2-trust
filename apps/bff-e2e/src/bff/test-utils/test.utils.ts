/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrismaClient } from '@prisma/client';
import { seedDatabase } from '@h2-trust/database';

const prisma = new PrismaClient();

function beforeAllAndAfterAll(): void {
  beforeAll(async () => {
    await resetTables();
  });

  afterAll(async () => {
    await resetTables();
    await prisma.$disconnect();
  });
}

async function resetTables(): Promise<void> {
  await prisma.$executeRaw`TRUNCATE TABLE "Address", "PowerProductionUnitType", "ElectrolysisType", "ProcessType", "EnergySource" RESTART IDENTITY CASCADE`;
  await seedDatabase();
}

export { prisma, beforeAllAndAfterAll };
