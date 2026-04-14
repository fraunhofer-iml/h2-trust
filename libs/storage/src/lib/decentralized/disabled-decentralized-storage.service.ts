import { Readable } from "stream";
import { ContentType } from "../content-types";
import { DecentralizedStorageService } from "./decentralized-storage.service";

export class DisabledDecentralizedStorageService extends DecentralizedStorageService {
    readonly explorerUrl: string | null = null;

    async uploadFile(_fileName: string, _file: Buffer, _contentType: ContentType): Promise<string> {
        throw new Error('DecentralizedStorageService not initialized: verification is disabled.');
    }

    async downloadFile(_fileName: string): Promise<Readable> {
        throw new Error('DecentralizedStorageService not initialized: verification is disabled.');
    }
}