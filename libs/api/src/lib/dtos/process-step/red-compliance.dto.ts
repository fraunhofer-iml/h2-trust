export class RedComplianceDto {
  isRedCompliant: boolean;
  isGeoCorrelationValid: boolean;
  isTimeCorrelationValid: boolean;
  isAdditionalityFulfilled: boolean;

  constructor(isGeoCorrelationValid: boolean, isTimeCorrelationValid: boolean, isAdditionalityFulfilled: boolean) {
    this.isGeoCorrelationValid = isGeoCorrelationValid;
    this.isTimeCorrelationValid = isTimeCorrelationValid;
    this.isAdditionalityFulfilled = isAdditionalityFulfilled;
    this.isRedCompliant = this.isGeoCorrelationValid && this.isTimeCorrelationValid && this.isAdditionalityFulfilled;
  }
}
