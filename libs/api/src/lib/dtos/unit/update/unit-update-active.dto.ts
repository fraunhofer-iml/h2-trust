import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UnitUpdateActiveDto {
  @IsBoolean()
  @IsNotEmpty()
  active: boolean;

  constructor(active: boolean) {
    this.active = active;
  }
}
