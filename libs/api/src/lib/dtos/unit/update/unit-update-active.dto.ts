import { IsBoolean, IsNotEmpty } from 'class-validator';
import { UpdateUnitStatusPayload } from '@h2-trust/amqp';

export class UnitUpdateActiveDto {
  @IsBoolean()
  @IsNotEmpty()
  active: boolean;

  constructor(active: boolean) {
    this.active = active;
  }

  static toPayload(id: string, active: boolean): UpdateUnitStatusPayload {
    return new UpdateUnitStatusPayload(id, active);
  }
}
