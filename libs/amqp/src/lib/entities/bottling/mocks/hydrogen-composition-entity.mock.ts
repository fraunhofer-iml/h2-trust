import { HydrogenColorDbEnum } from 'libs/database/src/lib/enums';
import { HydrogenComponentEntity } from '../hydrogen-component.entity';

export const HydrogenCompositionEntityMock: HydrogenComponentEntity[] = [
  new HydrogenComponentEntity(HydrogenColorDbEnum.GREEN, 10),
  new HydrogenComponentEntity(HydrogenColorDbEnum.ORANGE, 20),
  new HydrogenComponentEntity(HydrogenColorDbEnum.PINK, 30),
  new HydrogenComponentEntity(HydrogenColorDbEnum.YELLOW, 40),
  new HydrogenComponentEntity(HydrogenColorDbEnum.MIX, 50),
];
