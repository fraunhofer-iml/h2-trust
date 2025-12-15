import { IsString } from 'class-validator';

export class ReadByIdPayload {
    @IsString()
    id!: string;

    static of(id: string): ReadByIdPayload {
        return { id };
    }
}