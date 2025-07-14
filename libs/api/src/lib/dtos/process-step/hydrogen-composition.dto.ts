import { HydrogenCompositionEntity } from "@h2-trust/amqp";

export class HydrogenCompositionDto {
  color: string;
  amount: number;

  constructor(color: string, amount: number) {
    this.color = color;
    this.amount = amount;
  }

  static of(hydrogenCompositionEntity: HydrogenCompositionEntity): HydrogenCompositionDto {
    return <HydrogenCompositionDto>{
      color: hydrogenCompositionEntity.color,
      amount: hydrogenCompositionEntity.amount
    };
  }
}
