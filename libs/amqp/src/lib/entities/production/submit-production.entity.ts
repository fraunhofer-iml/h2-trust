/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export class SubmitProductionProps {
  recordedBy: string;
  hydrogenStorageUnitId: string;
  importId: string;

  constructor(recordedBy: string, hydrogenStorageUnitId: string, importId: string) {
    this.recordedBy = recordedBy;
    this.hydrogenStorageUnitId = hydrogenStorageUnitId;
    this.importId = importId;
  }
}
