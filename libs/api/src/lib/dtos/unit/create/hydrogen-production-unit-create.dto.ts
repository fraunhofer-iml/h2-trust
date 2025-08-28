import { IsIn, IsNotEmpty, IsPositive } from 'class-validator';
import { BiddingZones, ElectrolysisType, HydrogenProductionType, UnitType } from '../../../enums';
import { AddressDto } from '../../address';
import { UnitCreateDto } from './unit-create.dto';

export class HydrogenProductionUnitCreateDto extends UnitCreateDto {
  @IsNotEmpty()
  @IsIn(Object.values(HydrogenProductionType))
  hydrogenProductionMethod: HydrogenProductionType;

  @IsNotEmpty()
  @IsIn(Object.values(ElectrolysisType))
  hydrogenProductionTechnology: ElectrolysisType;

  @IsNotEmpty()
  @IsIn(Object.values(BiddingZones))
  biddingZone: BiddingZones;

  @IsNotEmpty()
  @IsPositive()
  ratedPower: number;

  @IsNotEmpty()
  @IsPositive()
  pressure: number;

  constructor(
    type: UnitType,
    name: string,
    owner: string,
    operator: string,
    manufacturer: string,
    modelType: string,
    modelNumber: string,
    serialNumber: string,
    mastrNumber: string,
    certifiedBy: string,
    commissionedOn: string,
    address: AddressDto,
    hydrogenProductionMethod: HydrogenProductionType,
    hydrogenProductionTechnology: ElectrolysisType,
    biddingZone: BiddingZones,
    ratedPower: number,
    pressure: number,
  ) {
    super(
      type,
      name,
      owner,
      operator,
      manufacturer,
      modelType,
      modelNumber,
      serialNumber,
      mastrNumber,
      certifiedBy,
      commissionedOn,
      address,
    );
    this.hydrogenProductionMethod = hydrogenProductionMethod;
    this.hydrogenProductionTechnology = hydrogenProductionTechnology;
    this.biddingZone = biddingZone;
    this.ratedPower = ratedPower;
    this.pressure = pressure;
  }
}
