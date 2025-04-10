import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth/auth.service';
import { UsersService } from '../../shared/services/users/users.service';
import { hydrogenOptions } from './options/options';

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
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  hydrogenOptions = hydrogenOptions;
  userFirstName = '';
  userLastName = '';
  userEmail = '';
  constructor(readonly authService: AuthService, private accountService: UsersService) {}

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
