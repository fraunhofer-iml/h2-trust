/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
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

  sidebarOptions = [
    { title: 'Units', icon: 'water_drop', route: ROUTES.UNITS },
    { title: 'Production', icon: 'manufacturing', route: ROUTES.PRODUCTION },
    { title: 'Bottling', icon: 'propane_tank', route: ROUTES.BOTTLING },
  ];

  isAuthenticated = false;
  userFirstName = '';
  userLastName = '';
  userEmail = '';

  selectedIndex = -1;
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
