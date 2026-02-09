export class ProofEntity {
    uuid: string;
    hash: string
    cid: string;

    constructor(
        uuid: string,
        hash: string,
        cid: string,
    ) {
        this.uuid = uuid;
        this.hash = hash;
        this.cid = cid;
    }
}