export class ProcessingFilter {
  processType?: string;
  active?: boolean;
  companyId?: string;

  constructor(processType?: string, active?: boolean, companyId?: string) {
    this.processType = processType;
    this.active = active;
    this.companyId = companyId;
  }
}
