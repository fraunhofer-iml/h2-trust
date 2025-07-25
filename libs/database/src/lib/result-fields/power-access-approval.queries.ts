import { Prisma } from "@prisma/client";
import { baseUnitResultFields } from "./unit.result-fields";


export const powerAccessApprovalResultFields = Prisma.validator<Prisma.PowerAccessApprovalDefaultArgs>()({
    include: {
        powerProducer: {
            include: {
                address: true,
            },
        },
        hydrogenProducer: true,
        document: true,
        powerProductionUnit: {
            include: {
                generalInfo: {
                    ...baseUnitResultFields
                },
                type: true,
            },
        },
    },
});
