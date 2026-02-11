/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { readFileSync } from 'fs';
import {
  BaseContract,
  Contract,
  JsonRpcProvider,
  NonceManager,
  Wallet,
  type ContractTransactionResponse,
} from 'ethers';
import { Injectable, Logger } from '@nestjs/common';
import { ProofEntity } from '@h2-trust/amqp';
import { ConfigurationService } from '@h2-trust/configuration';

export interface ProofEntry {
  uuid: string;
  hash: string;
  cid: string;
}

interface Proof {
  hash: string;
  cid: string;
}

interface ProofStorageContract extends BaseContract {
  storeProofs(proofs: ProofEntry[]): Promise<ContractTransactionResponse>;
  getProofByUuid(uuid: string): Promise<Proof>;
}

@Injectable()
export class BlockchainService {
  readonly blockchainEnabled: boolean;

  private readonly logger = new Logger(this.constructor.name);
  private readonly contract: ProofStorageContract | null;

  constructor(private readonly configurationService: ConfigurationService) {
    this.blockchainEnabled = this.configurationService.getGlobalConfiguration().blockchain.enabled;

    if (this.blockchainEnabled) {
      const rpcUrl = this.configurationService.getGlobalConfiguration().blockchain.rpcUrl;
      const smartContractAddress = this.configurationService.getGlobalConfiguration().blockchain.smartContractAddress;

      this.logger.debug('🔗 Blockchain is enabled. Proofs will be stored and retrieved.');
      this.logger.debug(`🌐 RPC URL: ${rpcUrl}`);
      this.logger.debug(`📄 Smart Contract Address: ${smartContractAddress}`);

      this.contract = this.createContract();
    } else {
      this.logger.debug('⛓️‍💥 Blockchain is disabled. Proofs will not be stored or retrieved.');

      this.contract = null;
    }
  }

  private createContract(): ProofStorageContract {
    const blockchainConfiguration = this.configurationService.getGlobalConfiguration().blockchain;

    const smartContractAddress = blockchainConfiguration.smartContractAddress;

    const { abi } = JSON.parse(readFileSync(blockchainConfiguration.artifactPath, 'utf-8'));

    const provider = new JsonRpcProvider(blockchainConfiguration.rpcUrl);
    const wallet = new Wallet(blockchainConfiguration.privateKey, provider);
    const signer = new NonceManager(wallet);

    return new Contract(smartContractAddress, abi, signer) as unknown as ProofStorageContract;
  }

  async storeProofs(proofEntries: ProofEntry[]): Promise<string | null> {
    if (!this.blockchainEnabled) {
      this.logger.debug(`⏭️ Blockchain disabled, skipping proof storage of ${proofEntries.length} entries`);
      return null;
    }

    this.logger.debug(`📝 Storing proofs:\n${proofEntries.map((e) => JSON.stringify(e)).join('\n')}`);

    const tx = await this.contract.storeProofs(proofEntries);
    await tx.wait();

    this.logger.debug(`✅ Proof stored: ${tx.hash}`);
    return tx.hash;
  }

  async retrieveProof(uuid: string): Promise<ProofEntity | null> {
    if (!this.blockchainEnabled) {
      this.logger.debug(`⏭️ Blockchain disabled, skipping proof retrieval for ${uuid}`);
      return null;
    }

    this.logger.debug(`🔍 Retrieving proof: ${uuid}`);

    const proof: Proof = await this.contract.getProofByUuid(uuid);
    this.logger.debug(`✅ Proof retrieved: ${JSON.stringify(proof)}`);

    return new ProofEntity(uuid, proof.hash, proof.cid);
  }
}
