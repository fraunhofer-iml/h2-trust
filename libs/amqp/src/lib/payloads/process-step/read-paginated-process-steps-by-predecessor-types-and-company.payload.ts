import { IsNotEmpty } from 'class-validator';
import { ProductionDataFilter } from './production-data-filter';
import { ReadProcessStepsByPredecessorTypesAndOwnerPayload } from './read-process-steps-by-predecessor-types-and-company.payload';

export class ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload extends ReadProcessStepsByPredecessorTypesAndOwnerPayload {
  @IsNotEmpty()
  filter: ProductionDataFilter;

  constructor(predecessorProcessTypes: string[], ownerId: string, filter: ProductionDataFilter) {
    super(predecessorProcessTypes, ownerId);
    this.filter = filter;
  }
}
