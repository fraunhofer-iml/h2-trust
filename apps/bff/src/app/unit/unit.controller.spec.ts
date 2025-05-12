import { of } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { BrokerQueues, UnitMessagePatterns } from '@h2-trust/amqp';
import { UnitDto, UnitOverviewDto, UnitType } from '@h2-trust/api';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';

describe('UnitController', () => {
  let controller: UnitController;
  let queue: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitController],
      providers: [
        UnitService,
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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find all units', async () => {
    const expectedReturnValue = [];
    const sendRequestSpy = jest.spyOn(queue, 'send');
    sendRequestSpy.mockImplementation((messagePattern: UnitMessagePatterns.READ, data: any) => {
      return of([]);
    });
    const res: UnitOverviewDto[] = await controller.getUnits('', UnitType.hydrogenProductionUnit);

    expect(res).toEqual(expectedReturnValue);
  });

  it('should find a unit', async () => {
    const expectedReturnValue = <UnitDto>{};
    const sendRequestSpy = jest.spyOn(queue, 'send');
    sendRequestSpy.mockImplementation((messagePattern: UnitMessagePatterns.READ, data: any) => {
      return of({});
    });
    const res: UnitDto = await controller.getUnit('');

    expect(res).toEqual(expectedReturnValue);
  });
});
