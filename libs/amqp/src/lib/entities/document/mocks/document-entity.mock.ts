import { DocumentSeed } from 'libs/database/src/seed';
import { DocumentEntity } from '../document.entity';

export const DocumentEntityMock: DocumentEntity[] = DocumentSeed.map(
  (seed) => new DocumentEntity(seed.id, seed.description, seed.location),
);
