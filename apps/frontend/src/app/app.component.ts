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
