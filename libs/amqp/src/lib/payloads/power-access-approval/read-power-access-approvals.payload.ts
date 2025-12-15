import { PowerAccessApprovalStatus } from '@h2-trust/domain';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ReadPowerAccessApprovalsPayload {
    @IsString()
    @IsNotEmpty()
    userId!: string;

    @IsEnum(PowerAccessApprovalStatus)
    powerAccessApprovalStatus!: PowerAccessApprovalStatus;

    static of(userId: string, powerAccessApprovalStatus: PowerAccessApprovalStatus): ReadPowerAccessApprovalsPayload {
        return { userId, powerAccessApprovalStatus };
    }
}