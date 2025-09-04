import { EmissionDto } from '../emission.dto';

export const EmissionMock: EmissionDto = {
  amountCO2: 300,
  amountCO2PerKgH2: 5.7,
  basisOfCalculation: 'Emission (kg CO₂) = Fuel Amount (L or kg) × Emission Factor (kg CO₂ per L or kg)',
};
