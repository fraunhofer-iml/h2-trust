import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAnchor } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { PpaRequestCreateDto } from '@h2-trust/api';
import { PowerProductionType, PpaRequestRole } from '@h2-trust/domain';
import { PrettyEnumPipe } from '../../../shared/pipes/format-enum.pipe';
import { QUERY_KEYS } from '../../../shared/queries/shared-query-keys';
import { CompaniesService } from '../../../shared/services/companies/companies.service';
import { PowerAccessApprovalService } from '../../../shared/services/power-access-approvals/power-access-approvals.service';

interface RequestForm {
  companyId: FormControl<string | null>;
  powerProductionType: FormControl<PowerProductionType | null>;
  validFrom: FormControl<Date | null>;
  validTo: FormControl<Date | null>;
}

@Component({
  selector: 'app-create-ppa-request',
  imports: [
    MatAnchor,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    PrettyEnumPipe,
    CommonModule,
    MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './create-ppa-request.component.html',
})
export class CreatePpaRequestComponent {
  private companiesService = inject(CompaniesService);
  private ppaService = inject(PowerAccessApprovalService);
  private queryClient = inject(QueryClient);

  readonly dialogRef = inject(MatDialogRef<CreatePpaRequestComponent>);

  protected readonly availablePowerProductionType = Object.entries(PowerProductionType);

  protected today = new Date();

  form = new FormGroup<RequestForm>({
    companyId: new FormControl('', Validators.required),
    powerProductionType: new FormControl<PowerProductionType | null>(null, Validators.required),
    validFrom: new FormControl<Date | null>(null, Validators.required),
    validTo: new FormControl<Date | null>(null, Validators.required),
  });

  companiesQuery = injectQuery(() => ({
    queryKey: ['companies'],
    queryFn: () => this.companiesService.getCompanies(),
  }));

  mutation = injectMutation(() => ({
    mutationFn: (dto: PpaRequestCreateDto) => this.ppaService.createPpaRequest(dto),
    onError: () => toast.error('Failed to create PPA Request'),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.PPA_REQUESTS, PpaRequestRole.SENDER] });
      toast.success('Successfully created PPA Request');
    },
  }));

  close() {
    this.dialogRef.close();
  }

  save() {
    const dto: PpaRequestCreateDto = this.form.value as PpaRequestCreateDto;

    this.mutation.mutate(dto);
    this.close();
  }
}
