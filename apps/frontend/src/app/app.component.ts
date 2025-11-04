/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { NgxSonnerToaster } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';

@Component({
  imports: [CommonModule, SidebarComponent, RouterModule, NgxSonnerToaster],
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {}
