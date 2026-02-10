/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ERROR_MESSAGES } from '../../shared/constants/error.messages';

@Component({
  selector: 'app-error-card',
  imports: [MatIconModule],
  templateUrl: './error-card.component.html',
})
export class ErrorCardComponent {
  message = input<string>(ERROR_MESSAGES.unknownError);
}
