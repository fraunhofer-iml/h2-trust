import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-red-check-card',
  imports: [CommonModule],
  templateUrl: './red-check-card.component.html',
})
export class RedCheckCardComponent {
  content = input<{ TITLE: string; DESCRIPTION: string }>();
  isValid = input<boolean>(false);
}
