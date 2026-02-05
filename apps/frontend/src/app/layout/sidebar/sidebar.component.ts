/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterModule } from '@angular/router';
import { ChemicalNames } from '../../shared/constants/chemical-names';
import { ROUTES } from '../../shared/constants/routes';
import { AuthService } from '../../shared/services/auth/auth.service';
import { UsersService } from '../../shared/services/users/users.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    RouterModule,
    MatExpansionModule,
    MatSelectModule,
    A11yModule,
  ],
  providers: [UsersService],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  protected readonly ChemicalNames = ChemicalNames;
  protected readonly router = inject(Router);

  sidebarOptions = [
    {
      title: 'Units',
      icon: 'water_drop',
      route: ROUTES.UNITS,
      isActive: () => this.router.url.split('/')[1] === ROUTES.UNITS,
    },
    {
      title: 'Production',
      icon: 'manufacturing',
      route: null,
      isActive: () => false,
      children: [
        {
          title: 'CSV Uploads',
          icon: 'files',
          route: ROUTES.PRODUCTION_FILES,
          isActive: () => this.router.url.split('/')[2] === 'files',
        },
        {
          title: 'Generated Productions',
          icon: 'table',
          route: ROUTES.PRODUCTION_DATA,
          isActive: () => this.router.url.split('/')[2] === 'data',
        },
      ],
    },
    {
      title: 'Bottling',
      icon: 'propane_tank',
      route: ROUTES.BOTTLING,
      isActive: () => this.router.url.split('/')[1] === ROUTES.BOTTLING,
    },
  ];

  isAuthenticated = false;
  userFirstName = '';
  userLastName = '';
  userEmail = '';

  constructor(readonly authService: AuthService) {}

  async ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      const userProfile = await this.authService.getCurrentUserDetails();
      this.userFirstName = userProfile.firstName;
      this.userLastName = userProfile.lastName;
      this.userEmail = userProfile.email;
    }
  }

  logout() {
    this.authService.logout();
  }

  signIn() {
    this.authService.logIn();
  }
}
