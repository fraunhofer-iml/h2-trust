import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
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
  ],
  providers: [UsersService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  sidebarOptions = [
    { title: 'Units', icon: 'water_drop', route: ROUTES.UNITS },
    { title: 'Production', icon: 'manufacturing', route: ROUTES.PRODUCTION },
    { title: 'Processing', icon: 'dynamic_form', route: ROUTES.PROCESSING },
  ];

  userFirstName = '';
  userLastName = '';
  userEmail = '';

  selectedIndex = -1;
  constructor(readonly authService: AuthService) {}

  async ngOnInit() {
    const userProfile = await this.authService.getCurrentUserDetails();
    this.userFirstName = userProfile.firstName;
    this.userLastName = userProfile.lastName;
    this.userEmail = userProfile.email;
  }

  logout() {
    this.authService.logout();
  }
}
