import { Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-loading-modal',
  imports: [MatProgressBarModule],
  templateUrl: './loading-modal.component.html',
})
export class LoadingModalComponent {}
