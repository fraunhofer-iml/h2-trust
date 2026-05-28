import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AddBottleComponent } from './add-bottle/add-bottle.component';

@Component({
  selector: 'app-create-batch-page',
  imports: [RouterModule, AddBottleComponent],
  templateUrl: './create-batch-page.component.html',
})
export class CreateBatchPageComponent {}
