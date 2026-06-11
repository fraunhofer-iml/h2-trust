/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export class PaginatedDataDto<T> {
  data: T[];
  totalItems: number;
  currentPage: number;

  constructor(data: T[], totalItems: number, currentPage: number) {
    this.data = data;
    this.totalItems = totalItems;
    this.currentPage = currentPage;
  }

  static fromEntity<T>(items: T[], totalItems: number, currentPage: number): PaginatedDataDto<T> {
    return new PaginatedDataDto<T>(items, totalItems, currentPage);
  }
}
