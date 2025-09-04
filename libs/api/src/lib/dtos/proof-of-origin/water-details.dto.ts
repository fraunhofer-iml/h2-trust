import { EmissionDto } from './emission.dto';

export class WaterDetailsDto {
  amount: number;
  emission: EmissionDto;

  constructor(amount: number, emission: EmissionDto) {
    this.amount = amount;
    this.emission = emission;
  }
}
