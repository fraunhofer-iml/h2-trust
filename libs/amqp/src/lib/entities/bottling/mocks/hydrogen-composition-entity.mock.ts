import { HydrogenColorDbEnum } from 'libs/database/src/lib/enums';
import { HydrogenCompositionEntity } from '../hydrogen-composition.entity';

export const HydrogenCompositionEntityMock: HydrogenCompositionEntity[] = [
  new HydrogenCompositionEntity(HydrogenColorDbEnum.GREEN, 10),
  new HydrogenCompositionEntity(HydrogenColorDbEnum.ORANGE, 20),
  new HydrogenCompositionEntity(HydrogenColorDbEnum.PINK, 30),
  new HydrogenCompositionEntity(HydrogenColorDbEnum.YELLOW, 40),
  new HydrogenCompositionEntity(HydrogenColorDbEnum.MIX, 50),
];
