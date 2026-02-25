export interface ValidationResult {
  // TODO
  id: string;
  status: 'VERIFIED' | 'MISMATCHED' | 'FAILED';
  message: string;
  timestamp: string;
  contractAddress: string;
  txHash: string;
  network: string;
}
