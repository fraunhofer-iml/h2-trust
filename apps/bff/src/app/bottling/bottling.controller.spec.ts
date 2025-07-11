import { Test, TestingModule } from '@nestjs/testing';
import { BrokerQueues, ProcessStepEntity, ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { BottlingController } from './bottling.controller';
import { BottlingService } from './bottling.service';
import 'multer';
import { of } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import {
  BottlingDto,
  BottlingDtoMock,
  BottlingOverviewDto,
  HydrogenCompositionMock,
  ProcessType,
  ProductPassDto,
  UserDetailsDtoMock,
} from '@h2-trust/api';
import { UserService } from '../user/user.service';

describe('BottlingController', () => {
  let controller: BottlingController;
  let userService: UserService;
  let batchSvc: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [BottlingController],
      providers: [
        BottlingService,
        {
          provide: BrokerQueues.QUEUE_BATCH_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            readUserWithCompany: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BottlingController>(BottlingController);
    batchSvc = module.get<ClientProxy>(BrokerQueues.QUEUE_BATCH_SVC) as ClientProxy;
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a bottling batch', async () => {
    const givenDto: BottlingDto = BottlingDtoMock[0];
    const processStepEntityMock: ProcessStepEntity = {
      id: 'bottling-process-step-1',
      startedAt: new Date(givenDto.filledAt),
      endedAt: new Date(givenDto.filledAt),
    };

    const expectedResponse: BottlingOverviewDto = BottlingOverviewDto.fromEntity(processStepEntityMock);

    jest
      .spyOn(batchSvc, 'send')
      .mockImplementation((_messagePattern: ProcessStepMessagePatterns, _data: any) => of(processStepEntityMock));

    const actualResponse: BottlingOverviewDto = await controller.createBottling(givenDto, null, { sub: 'user-id-1' });

    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should read bottling batches', async () => {
    const processStepEntityMocks: ProcessStepEntity[] = [
      {
        id: 'bottling-process-step-1',
        startedAt: new Date(BottlingDtoMock[0].filledAt),
        endedAt: new Date(BottlingDtoMock[0].filledAt),
      },
    ];

    const expectedResponse: BottlingOverviewDto[] = processStepEntityMocks.map(BottlingOverviewDto.fromEntity);

    jest.spyOn(userService, 'readUserWithCompany').mockResolvedValue(UserDetailsDtoMock[0]);

    jest
      .spyOn(batchSvc, 'send')
      .mockImplementation((_messagePattern: ProcessStepMessagePatterns, _data: any) => of(processStepEntityMocks));

    const actualResponse: BottlingOverviewDto[] = await controller.readBottlingsByCompany({ sub: 'user-id-1' });

    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should read product pass', async () => {
    const givenProcessStepIdParam = 'bottling-process-step-1';

    const processStepEntityMock: ProcessStepEntity = {
      id: 'bottling-process-step-1',
      startedAt: new Date(BottlingDtoMock[0].filledAt),
      endedAt: new Date(BottlingDtoMock[0].filledAt),
      processType: ProcessType.BOTTLING,
    };

    const expectedResponse: ProductPassDto = {
      ...ProductPassDto.fromEntityToDto(processStepEntityMock),
      hydrogenComposition: HydrogenCompositionMock
    };
    expectedResponse.producer = UserDetailsDtoMock[0].name;

    jest.spyOn(userService, 'readUserWithCompany').mockResolvedValue(UserDetailsDtoMock[0]);

    jest
      .spyOn(batchSvc, 'send')
      .mockImplementation((_messagePattern: ProcessStepMessagePatterns, _data: any) => of(processStepEntityMock));

    const actualResponse: ProductPassDto = await controller.readProductPass(givenProcessStepIdParam);

    expect(actualResponse).toEqual(expectedResponse);
  });
});
