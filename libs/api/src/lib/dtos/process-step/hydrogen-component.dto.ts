import { HydrogenComponentEntity } from '@h2-trust/amqp';

export class HydrogenComponentDto {
  color: string;
  amount: number;

  constructor(color: string, amount: number) {
    this.color = color;
    this.amount = amount;
  }

  static of(hydrogenComponentEntity: HydrogenComponentEntity): HydrogenComponentDto {
    return <HydrogenComponentDto>{
      color: hydrogenComponentEntity.color,
      amount: hydrogenComponentEntity.amount,
    };
  }
}
