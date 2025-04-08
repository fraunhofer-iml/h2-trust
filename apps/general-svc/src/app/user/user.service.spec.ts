import { Test, TestingModule } from '@nestjs/testing';
import { Companies, DatabaseModule, PrismaService, Users, userWithCompanyResultFields } from '@h2-trust/database';
import { UserService } from './user.service';

// TODO-MP: see integration tests in skala
describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get an user and hist company by ID', async () => {
    const user = {
      ...Users[1],
      company: Companies[1],
    };

    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);

    const response = await service.readUserWithCompany(user.id);

    expect(response).toEqual(user);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: user.id,
      },
      ...userWithCompanyResultFields,
    });
  });
});
