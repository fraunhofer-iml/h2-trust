/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { assertDefined, assertValidTimeZone } from './assertions.util';

export class DateTimeUtil {
  static toValidDate(value: unknown, name: string): Date {
    assertDefined(value, name);

    if (!(value instanceof Date || typeof value === 'string' || typeof value === 'number')) {
      throw new Error(`[${name}] must be a Date, string or number: ${value}`);
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new Error(`[${name}] is not a valid date: ${value}`);
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

  static convertDateToSeconds(date: Date): number {
    if (!date || !(date instanceof Date)) {
      throw new Error('Invalid date parameter');
    }

    return Math.floor(date.getTime() / 1000);
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
    assertDefined(date, 'date');
    assertDefined(months, 'months');

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
    assertDefined(date, 'date');

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * Accepts a timestamp as string and converts it to UTC.
   * @param value The date string that should be converted to UTC
   * @param timeZone The name of the time zone of the value.
   * @returns The date string as UTC date.
   */
  static parseLocalTimeToUTC(timeString: string, timeZone: string): Date {
    const [inputDatePart, inputTimePart] = timeString.split(/\s+/);
    const [inputDay, inputMonth, inputYear] = inputDatePart.split('.').map(Number);
    const [inputHour, inputMinute] = inputTimePart.split(':').map(Number);

    assertValidTimeZone(timeZone, 'timezone');

    const timeZoneFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    //The input time interpreted as UTC (will be used for the offset calculation)
    const localInputDateAsUTC = new Date(Date.UTC(inputYear, inputMonth - 1, inputDay, inputHour, inputMinute, 0));

    //The input time converted to the local format (will be used to get the offset)
    const localFormatDate = timeZoneFormatter.formatToParts(localInputDateAsUTC);
    const localFormatHour = parseInt(localFormatDate.find((p) => p.type === 'hour')?.value || '0');
    const localFormatMinute = parseInt(localFormatDate.find((p) => p.type === 'minute')?.value || '0');

    //Calculate the offset
    const hourDiff = inputHour - localFormatHour;
    const minuteDiff = inputMinute - localFormatMinute;

    return new Date(localInputDateAsUTC.getTime() + hourDiff * 3600000 + minuteDiff * 60000);
  }
}
