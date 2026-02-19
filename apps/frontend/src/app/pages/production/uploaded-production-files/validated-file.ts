export interface ValidationResult {
  // TODO
  id: string;
  status: 'VERIFIED' | 'MISMATCHED' | 'FAILED';
  tooltip: string;
}
