import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { FuelType, TransportType } from '@h2-trust/domain';
import { EnumPipe } from '../../../../shared/pipes/enum.pipe';
import { HydrogenTransportFormGroup } from '../forms';

@Component({
  selector: 'app-hydrogen-transport',
  imports: [MatSelectModule, FormsModule, ReactiveFormsModule, CommonModule, EnumPipe],
  templateUrl: './hydrogen-transport.component.html',
})
export class HydrogenTransportComponent {
  protected readonly TransportType = TransportType;
  protected readonly FuelType = FuelType;

  hydrogenTransportForm = input.required<FormGroup<HydrogenTransportFormGroup>>();

  ngOnInit() {
    this.hydrogenTransportForm().controls.transportType.valueChanges.subscribe((transportType) => {
      if (transportType === TransportType.PIPELINE) {
        this.hydrogenTransportForm().controls.fuelType.setValidators(null);
        this.hydrogenTransportForm().controls.fuelType.setValue(null);
        this.hydrogenTransportForm().controls.fuelType.disable();
      } else {
        this.hydrogenTransportForm().controls.fuelType.enable();
        this.hydrogenTransportForm().controls.fuelType.setValidators(Validators.required);
      }
      this.hydrogenTransportForm().controls.fuelType.updateValueAndValidity();
    });
  }
}
