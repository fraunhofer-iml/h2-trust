import { of } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { BrokerQueues, UnitMessagePatterns } from '@h2-trust/amqp';
import { UnitDto, UnitOverviewDto, UnitType, UserDetailsDto } from '@h2-trust/api';
import { UserService } from '../user/user.service';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';

describe('UnitController', () => {
  let controller: UnitController;
  let queue: ClientProxy;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitController],
      providers: [
        UnitService,
        UserService,
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UnitController>(UnitController);
    queue = module.get<ClientProxy>(BrokerQueues.QUEUE_GENERAL_SVC) as ClientProxy;
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find a unit', async () => {
    const expectedResponse = <UnitDto>{};
    const sendRequestSpy = jest.spyOn(queue, 'send');
    sendRequestSpy.mockImplementation((_messagePattern: UnitMessagePatterns.READ, _data: any) => {
      return of({});
    });
    const actualResponse: UnitDto = await controller.getUnit('');

    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should find all units', async () => {
    const user = { company: { id: '' } } as UserDetailsDto;

    const expectedReturnValue: UnitDto[] = [];
    const sendRequestSpy = jest.spyOn(queue, 'send');
    sendRequestSpy.mockImplementation(
      (_messagePattern: UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS, _data: any) => {
        return of([]);
      },
    );
    jest.spyOn(userService, 'readUserWithCompany').mockResolvedValue(user);

    const actualResponse: UnitOverviewDto[] = await controller.getUnits(UnitType.hydrogenProductionUnit, {
      sub: '6f63a1a9-6cc5-4a7a-98b2-79a0460910f4',
    });

    expect(actualResponse).toEqual(expectedReturnValue);
  });
});
