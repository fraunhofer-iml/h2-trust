/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isBefore', async: false })
export class IsBeforeConstraint implements ValidatorConstraintInterface {
  validate(validTo: Date, args: ValidationArguments) {
    const object = args.object as { validFrom?: Date };
    const validFrom: Date | undefined = object.validFrom;

    if (!validFrom) return false;
    return validFrom < validTo;
  }

  defaultMessage() {
    return 'validFrom needs to be before validTo';
  }
}
