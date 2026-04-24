/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { StorageService } from '../storage.service';

export abstract class CentralizedStorageService extends StorageService {
  abstract fileExists(fileName: string): Promise<boolean>;
}
