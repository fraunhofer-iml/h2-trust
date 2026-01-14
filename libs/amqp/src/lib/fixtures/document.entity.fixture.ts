import { DocumentEntity } from '@h2-trust/amqp';

export const DocumentEntityFixture = {
  create: (overrides: Partial<DocumentEntity> = {}): DocumentEntity =>
    new DocumentEntity(
      overrides.id ?? 'document-1',
      overrides.description ?? 'Dummy Document',
      overrides.location ?? 'https://files.example.com/dummy-document.pdf',
    ),
} as const;
