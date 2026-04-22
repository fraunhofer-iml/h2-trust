/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export class ProofEntity {
  uuid: string;
  hash: string;
  cid: string;

  constructor(uuid: string, hash: string, cid: string) {
    this.uuid = uuid;
    this.hash = hash;
    this.cid = cid;
  }
}
