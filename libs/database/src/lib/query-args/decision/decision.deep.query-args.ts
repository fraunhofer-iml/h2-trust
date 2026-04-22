import { Prisma } from '@prisma/client';
import { powerProductionUnitDeepQueryArgs } from '../unit';
import { userDeepQueryArgs } from '../user';

export const decisionDeepQueryArgs = Prisma.validator<Prisma.DecisionDefaultArgs>()({
  include: {
    decidingUser: userDeepQueryArgs,
    grantedPowerProductionUnit: powerProductionUnitDeepQueryArgs,
  },
});
