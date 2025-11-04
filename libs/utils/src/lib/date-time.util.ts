/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export class DateTimeUtil {
  static convertDateStringToSeconds(date: string): number {
    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date string: "${date}"`);
    }

    return Math.floor(parsedDate.getTime() / 1000);
  }
}
