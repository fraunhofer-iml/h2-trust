/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

interface Data {
  name: string;
  records: any[];
  createRecord: (record: any) => Promise<any>;
}

async function importData(data: Data[]) {
  console.log('🚀 Data import started...\n');
  let counter = 0;

  for (const entry of data) {
    console.log(`📦 Import of '${entry.name}' initiated...`);

    const creationPromises = entry.records.map((record) => entry.createRecord(record));
    await Promise.all(creationPromises);

    counter += entry.records.length;

    console.log(`✅ Import of ${entry.records.length} '${entry.name}' records completed.\n`);
  }

  console.log(`🚀 Data import finished with ${counter} records processed.`);
}

export { Data, importData };
