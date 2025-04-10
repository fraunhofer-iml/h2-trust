export class ProcessFilter {
  processName?: string;
  active?: boolean;
  companyId?: string;

  constructor(processName?: string, active?: boolean, companyId?: string) {
    this.processName = processName;
    this.active = active;
    this.companyId = companyId;
  }
}
