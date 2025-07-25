import { Prisma } from "@prisma/client";
import { powerAccessApprovalResultFields } from "../result-fields/power-access-approval.queries";



export type PowerAccessApprovalDbType = Prisma.PowerAccessApprovalGetPayload<typeof powerAccessApprovalResultFields>;
