import { Injectable } from '@nestjs/common';
import { DocumentEntity } from '@h2-trust/amqp';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DocumentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async addDocumentToProcessStep(document: DocumentEntity, processStepId: string): Promise<DocumentEntity> {
    return this.prismaService.document
      .create({
        data: {
          description: document.description ?? '',
          location: document.location,
          processStep: {
            connect: {
              id: processStepId,
            },
          },
        },
      })
      .then(DocumentEntity.fromDatabase);
  }
}
