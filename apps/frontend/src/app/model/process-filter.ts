export class ProcessingFilter {
  processTypeName?: string;
  active?: boolean;
  companyId?: string;

  constructor(processTypeName?: string, active?: boolean, companyId?: string) {
    this.processTypeName = processTypeName;
    this.active = active;
    this.companyId = companyId;
  }
}
