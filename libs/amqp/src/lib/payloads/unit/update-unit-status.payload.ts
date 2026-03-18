import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUnitStatusPayload {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsBoolean()
  @IsNotEmpty()
  active: boolean;

  constructor(id: string, active: boolean) {
    this.id = id;
    this.active = active;
  }
}
