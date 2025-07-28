import { EmissionDto } from '../emission.dto';

export const EmissionMock: EmissionDto = {
  amount: 300,
  calculation: 'Emission (kg CO₂) = Fuel Amount (L or kg) × Emission Factor (kg CO₂ per L or kg)',
  savingsPotential: 89.5,
};
