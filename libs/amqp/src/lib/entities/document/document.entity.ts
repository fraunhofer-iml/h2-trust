// eslint-disable-next-line @nx/enforce-module-boundaries
import { DocumentDbType } from '@h2-trust/database';

export class DocumentEntity {
  id?: string;
  description: string;
  location: string;

  constructor(id: string, description: string, location: string) {
    this.id = id;
    this.description = description;
    this.location = location;
  }

  static fromDatabase(document: DocumentDbType): DocumentEntity {
    return <DocumentEntity>{
      id: document.id,
      description: document.description,
      location: document.location,
    };
  }
}
