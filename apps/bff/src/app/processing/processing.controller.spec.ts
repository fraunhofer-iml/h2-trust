import { of } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { BrokerQueues, ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { ProcessingOverviewDto } from '@h2-trust/api';
import { ProcessingController } from './processing.controller';
import { ProcessingService } from './processing.service';

describe('ProcessingController', () => {
  let controller: ProcessingController;
  let queue: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcessingController],
      providers: [
        ProcessingService,
        {
          provide: BrokerQueues.QUEUE_BATCH_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProcessingController>(ProcessingController);
    queue = module.get<ClientProxy>(BrokerQueues.QUEUE_BATCH_SVC) as ClientProxy;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find all processing data', async () => {
    const mock = <ProcessingOverviewDto>{
      id: '',
      timestamp: new Date(),
      owner: '',
      filledAmount: 5,
      color: '',
    };

    const expectedReturnValue = [
      { color: undefined, filledAmount: undefined, owner: undefined, timestamp: undefined, id: '' },
    ];
    const sendRequestSpy = jest.spyOn(queue, 'send');
    sendRequestSpy.mockImplementation((messagePattern: ProcessStepMessagePatterns, data: any) => {
      return of([mock]);
    });
    const res: ProcessingOverviewDto[] = await controller.readProcessing('', true, '');
    expect(sendRequestSpy).toHaveBeenCalledWith(ProcessStepMessagePatterns.READ_ALL, {
      active: true,
      companyId: '',
      processTypeName: '',
    });
    expect(res).toEqual(expectedReturnValue);
  });
});
