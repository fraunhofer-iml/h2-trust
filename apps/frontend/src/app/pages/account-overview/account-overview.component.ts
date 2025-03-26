import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroupDirective, FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserDetailsDto, USERDETAILSDTOMOCK } from '@h2-trust/api';
import { AuthService } from '../../shared/services/auth/auth.service';
import { UsersService } from '../../shared/services/users/users.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-account-overview',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
  ],
  providers: [AuthService],
  templateUrl: './account-overview.component.html',
  styleUrl: './account-overview.component.scss',
})
export class AccountOverviewComponent {
  userDetails = USERDETAILSDTOMOCK;
  constructor(private readonly authService: AuthService, private readonly accountService: UsersService) {
    accountService.getUserAccountInformation(this.authService.getUserId()).subscribe((details: UserDetailsDto) => {
      this.userDetails = details;
    });
  }
}
