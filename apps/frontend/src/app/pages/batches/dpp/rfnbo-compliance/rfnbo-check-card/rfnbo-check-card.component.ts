/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-rfnbo-check-card',
  imports: [CommonModule],
  templateUrl: './rfnbo-check-card.component.html',
})
export class RfnboCheckCardComponent {
  content = input<{ TITLE: string; DESCRIPTION: string }>();
  isValid = input<boolean>(false);
}
