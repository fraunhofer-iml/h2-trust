export class RedComplianceDto {
  isRedCompliant: boolean;
  isGeoCorrelationValid: boolean;
  isTimeCorrelationValid: boolean;
  isAdditionalityFulfilled: boolean;
  financialSupportReceived: boolean;

  constructor(
    isGeoCorrelationValid: boolean,
    isTimeCorrelationValid: boolean,
    isAdditionalityFulfilled: boolean,
    financialSupportReceived: boolean,
  ) {
    this.isGeoCorrelationValid = isGeoCorrelationValid;
    this.isTimeCorrelationValid = isTimeCorrelationValid;
    this.isAdditionalityFulfilled = isAdditionalityFulfilled;
    this.financialSupportReceived = financialSupportReceived;

    this.isRedCompliant =
      this.isGeoCorrelationValid &&
      this.isTimeCorrelationValid &&
      this.isAdditionalityFulfilled &&
      this.financialSupportReceived;
  }
}
