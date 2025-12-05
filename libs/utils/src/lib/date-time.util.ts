/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export class DateTimeUtil {
  static convertDateStringToMilliseconds(date: string): number {
    const parsedDate = new Date(date);

    const milliseconds = parsedDate.getTime();
    if (!Number.isFinite(milliseconds)) {
      throw new Error(`Invalid date string: "${date}"`);
    }

    return milliseconds;
  }

  static convertDateStringToSeconds(date: string): number {
    return Math.floor(DateTimeUtil.convertDateStringToMilliseconds(date) / 1000);
  }

  static convertDateToMilliseconds(date: Date | string): number {
    if (date == null) {
      throw new Error('Date parameter cannot be null or undefined');
    }

    if (date instanceof Date) {
      return date.getTime();
    }

    return DateTimeUtil.convertDateStringToMilliseconds(date);
  }

  static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
}
