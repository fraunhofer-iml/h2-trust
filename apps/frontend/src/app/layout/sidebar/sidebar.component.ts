/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, Signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterModule } from '@angular/router';
import { ROUTES } from '../../shared/constants/routes';
import { AuthService } from '../../shared/services/auth/auth.service';
import { UsersService } from '../../shared/services/users/users.service';
import { HydrogenProductionUnitsStore } from '../../shared/store/hydrogen-production-units.store';

interface SidebarOption {
  title: string;
  icon: string;
  route: ROUTES | null;
  visible: Signal<boolean>;
  children?: SidebarOption[];
}

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
  ],
  providers: [UsersService],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  protected readonly router = inject(Router);
  protected readonly hydrogenProducerStore = inject(HydrogenProductionUnitsStore);

  visible$ = computed(() => this.hydrogenProducerStore.hydrogenProductionUnits$().length > 0);

  sidebarOptions: SidebarOption[] = [
    {
      title: 'Units',
      icon: 'water_drop',
      route: ROUTES.UNITS,
      visible: signal(true),
    },
    {
      title: 'Production',
      icon: 'manufacturing',
      route: null,
      visible: signal(true),
      children: [
        {
          title: 'Data',
          icon: 'table',
          route: ROUTES.PRODUCTION_DATA,
          visible: this.visible$,
        },
        {
          title: 'Uploads',
          icon: 'files',
          route: ROUTES.PRODUCTION_FILES,
          visible: signal(true),
        },
      ],
    },
    {
      title: 'Bottling',
      icon: 'propane_tank',
      route: ROUTES.BOTTLING,
      visible: this.visible$,
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
      this.hydrogenProducerStore.loadUnits();

      const userProfile = await this.authService.getCurrentUserDetails();
      this.userFirstName = userProfile.firstName;
      this.userLastName = userProfile.lastName;
      this.userEmail = userProfile.email;
    }
  }

  isActive(route: string | null): boolean {
    if (!route) return false;
    return this.router.url.includes(route);
  }

  logout() {
    this.authService.logout();
  }

  signIn() {
    this.authService.logIn();
  }
}
