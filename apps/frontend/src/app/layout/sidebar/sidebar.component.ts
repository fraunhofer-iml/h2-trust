import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { UserDetailsDto } from '@h2-trust/api';
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
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  userDetails$: Observable<UserDetailsDto | null> = of(null);
  hydrogenOptions = hydrogenOptions;
  constructor(readonly authService: AuthService, private accountService: UsersService) {}

  ngOnInit(): void {
    this.userDetails$ = this.accountService.getUserAccountInformation(this.authService.getUserId());
  }

  logout() {
    this.authService.logout();
  }
}
