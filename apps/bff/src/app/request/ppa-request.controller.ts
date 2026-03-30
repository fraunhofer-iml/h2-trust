import { Controller, Get, Query } from '@nestjs/common';
import { PpaRequestDto, UserDetailsDto } from '@h2-trust/api';
import { PowerAccessApprovalStatus, PowerType, PpaRequestRole } from '@h2-trust/domain';

@Controller('ppa-requests')
export class PpaRequestController {
  @Get()
  getPPARequest(
    @Query('role') _role: PpaRequestRole,
    @Query('status') _status: PowerAccessApprovalStatus,
  ): PpaRequestDto[] {
    const requests = [
      {
        id: '123',
        timestamp: new Date().toDateString(),
        sender: { name: 'Petra', company: { name: 'petra company' } } as UserDetailsDto,
        receiver: { name: 'Hannes', company: { name: 'hannes company' } } as UserDetailsDto,
        powerType: PowerType.PARTLY_RENEWABLE,
        status: PowerAccessApprovalStatus.PENDING,
        powerProductionUnit: {
          id: '123456',
          name: 'test unit',
          typeName: 'type',
          active: true,
          producing: true,
          ratedPower: 200,
        },
      },
      {
        id: '456',
        timestamp: new Date().toDateString(),
        sender: { name: 'Petra', company: { name: 'petra company' } } as UserDetailsDto,
        receiver: { name: 'Hannes', company: { name: 'hannes company' } } as UserDetailsDto,
        powerType: PowerType.PARTLY_RENEWABLE,
        status: PowerAccessApprovalStatus.REJECTED,
        powerProductionUnit: {
          id: '123456',
          name: 'test unit',
          typeName: 'type',
          active: true,
          producing: true,
          ratedPower: 200,
        },
        comment: 'Unfortunately we have come to the decision th move in other directions.',
      },
      {
        id: '456',
        timestamp: new Date().toDateString(),
        sender: { name: 'Petra Power', company: { name: 'GreenPower company' } } as UserDetailsDto,
        receiver: { name: 'Hannes', company: { name: 'hannes company' } } as UserDetailsDto,
        powerType: PowerType.PARTLY_RENEWABLE,
        status: PowerAccessApprovalStatus.APPROVED,
        powerProductionUnit: {
          id: '123456',
          name: 'test unit',
          typeName: 'type',
          active: true,
          producing: true,
          ratedPower: 200,
        },
      },
      {
        id: '456',
        timestamp: new Date().toDateString(),
        sender: { name: 'Petra Power', company: { name: 'GreenPower company' } } as UserDetailsDto,
        receiver: { name: 'Hannes', company: { name: 'hannes company' } } as UserDetailsDto,
        powerType: PowerType.PARTLY_RENEWABLE,
        status: PowerAccessApprovalStatus.APPROVED,
        powerProductionUnit: {
          id: '123456',
          name: 'test unit',
          typeName: 'type',
          active: true,
          producing: true,
          ratedPower: 200,
        },
      },
    ];

    return requests;
  }
}
