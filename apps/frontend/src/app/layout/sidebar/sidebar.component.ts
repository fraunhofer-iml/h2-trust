/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { PowerAccessApprovalStatus, PpaRequestRole } from '@h2-trust/domain';
import { ROUTES } from '../../shared/constants/routes';
import { UserProfile } from '../../shared/model/user-profile.model';
import { AuthService } from '../../shared/services/auth/auth.service';
import { PowerPurchaseAgreementService } from '../../shared/services/power-purchase-agreement/power-purchase-agreement.service';
import { UnitsService } from '../../shared/services/units/units.service';
import { UsersService } from '../../shared/services/users/users.service';
import { UserRolesStore } from '../../shared/store/user-role.store';

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
    MatBadgeModule,
    MatMenuModule,
  ],
  providers: [UsersService],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  protected readonly router = inject(Router);
  protected readonly unitsService = inject(UnitsService);
  protected readonly ppaService = inject(PowerPurchaseAgreementService);
  protected readonly authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  protected isMenuOpen = false;

  ppaRequestsQuery = injectQuery(() => ({
    queryKey: ['ppa-requests', PowerAccessApprovalStatus.PENDING],
    queryFn: () => this.ppaService.getPpaRequests(PpaRequestRole.RECEIVER, PowerAccessApprovalStatus.PENDING),
  }));

  protected roles = inject(UserRolesStore);

  visible$ = computed(() => this.roles.isHydrogenProducer());

  showBadge$ = computed(() => (this.ppaRequestsQuery.data()?.length ?? 0) > 0);

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

  authenticated = false;
  profile: UserProfile = {} as UserProfile;

  async ngOnInit() {
    this.authenticated = this.authService.isAuthenticated();
    if (this.authenticated) {
      this.profile = await this.authService.getCurrentUserDetails();
    }

    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.isMenuOpen = false;
    });
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

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
