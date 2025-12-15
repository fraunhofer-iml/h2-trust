import { IsArray } from 'class-validator';

export class ReadByIdsPayload {
    @IsArray()
    ids!: string[];

    static of(ids: string[]): ReadByIdsPayload {
        return { ids };
    }
}