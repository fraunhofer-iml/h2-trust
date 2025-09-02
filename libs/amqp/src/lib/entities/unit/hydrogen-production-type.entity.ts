import { HydrogenProductionTypeDbType } from '@h2-trust/database';

export class HydrogenProductionTypeEntity {
  id: string;
  method: string;
  technology: string;

  constructor(id: string, method: string, technology: string) {
    this.id = id;
    this.method = method;
    this.technology = technology;
  }

  static fromDatabase(hydrogenProductionTypeDbType: HydrogenProductionTypeDbType): HydrogenProductionTypeEntity {
    return <HydrogenProductionTypeEntity>{
      id: hydrogenProductionTypeDbType.id,
      method: hydrogenProductionTypeDbType.method,
      technology: hydrogenProductionTypeDbType.technology,
    };
  }
}
