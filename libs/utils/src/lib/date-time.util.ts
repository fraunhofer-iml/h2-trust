/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { assertDefined } from './assertions';

export class DateTimeUtil {
  static toValidDate(value: unknown, name: string): Date {
    assertDefined(value, name);
    let date: Date;
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      date = new Date(value);
    } else {
      const message = `${name} must be a string, number or Date: ${value}`;
      throw new Error(message);
    }
    if (Number.isNaN(date.getTime())) {
      const message = `${name} is not a valid date: ${value}`;
      throw new Error(message);
    }
    return date;
  }

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

  // Ensures safe subtraction of months
  // XXXX-03-31 minus one month becomes XXXX-02-28, not XXXX-03-03.
  static subtractMonthsSafe(date: Date, months: number): Date {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    const targetIndex = month - months;
    const targetYear = year + Math.floor(targetIndex / 12);
    const targetMonth = ((targetIndex % 12) + 12) % 12;
    const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
    const clampedDay = Math.min(day, lastDay);
    return new Date(Date.UTC(targetYear, targetMonth, clampedDay, 0, 0, 0, 0));
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
