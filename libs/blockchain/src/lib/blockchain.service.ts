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

export interface BlockchainMetadata {
  blockNumber: number;
  blockTimestamp: Date;
}

interface ProofStorageContract extends BaseContract {
  storeProofs(proofs: ProofEntry[]): Promise<ContractTransactionResponse>;
  getProofByUuid(uuid: string): Promise<Proof>;
}

@Injectable()
export class BlockchainService {
  readonly endpointUrl?: string;
  readonly explorerUrl?: string;
  readonly smartContractAddress?: string;

  private readonly contract?: ProofStorageContract;
  private readonly logger = new Logger(this.constructor.name);

  constructor(configurationService: ConfigurationService) {
    const { featureFlags, verification } = configurationService.getGlobalConfiguration();

    if (featureFlags.verificationEnabled) {
      // verification is guaranteed to be defined when verificationEnabled is true (set together in config)
      this.endpointUrl = verification!.blockchain.endpointUrl;
      this.explorerUrl = verification!.blockchain.explorerUrl;
      this.smartContractAddress = verification!.blockchain.smartContractAddress;

      this.logger.debug('🔗 Blockchain integration initialized.');
      this.logger.debug(`🌐 Endpoint: ${this.endpointUrl}`);
      this.logger.debug(`🧭 Explorer: ${this.explorerUrl}`);
      this.logger.debug(`📄 Contract: ${this.smartContractAddress}`);

      this.contract = this.createContract(verification!.blockchain.artifactPath, verification!.blockchain.privateKey);
    } else {
      this.logger.debug('⛓️‍💥 Blockchain integration disabled.');
    }
  }

  private createContract(artifactPath: string, privateKey: string): ProofStorageContract {
    const { abi } = JSON.parse(readFileSync(artifactPath, 'utf-8'));

    const provider = new JsonRpcProvider(this.endpointUrl);
    const wallet = new Wallet(privateKey, provider);
    const signer = new NonceManager(wallet);

    return new Contract(this.smartContractAddress, abi, signer) as unknown as ProofStorageContract;
  }

  async storeProofs(proofEntries: ProofEntry[]): Promise<string> {
    if (!this.contract) {
      throw new Error('Store failed: blockchain service not initialized.');
    }

    this.logger.debug(`Storing proofs:\n${proofEntries.map((e) => JSON.stringify(e)).join('\n')}`);

    const tx = await this.contract.storeProofs(proofEntries);
    await tx.wait();

    this.logger.debug(`Stored proofs, tx: ${tx.hash}`);
    return tx.hash;
  }

  async retrieveProof(uuid: string): Promise<ProofEntity | null> {
    if (!this.contract) {
      throw new Error('Retrieve failed: blockchain service not initialized.');
    }

    try {
      const proof: Proof = await this.contract.getProofByUuid(uuid);
      this.logger.debug(`Retrieved proof '${uuid}': ${JSON.stringify(proof)}`);
      return new ProofEntity(uuid, proof.hash, proof.cid);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Retrieve failed for '${uuid}': ${errorMessage}`, error instanceof Error ? error.stack : undefined);
      return null;
    }
  }

  async retrieveBlockchainMetadata(transactionHash: string): Promise<BlockchainMetadata | null> {
    if (!this.contract) {
      throw new Error('Retrieve metadata failed: blockchain service not initialized.');
    }

    const receipt = await this.contract.runner.provider.getTransactionReceipt(transactionHash);

    if (!receipt) {
      this.logger.warn(`Transaction receipt not found for '${transactionHash}'`);
      return null;
    }

    const block = await this.contract.runner.provider.getBlock(receipt.blockNumber);

    if (!block) {
      this.logger.warn(`Block not found for '${receipt.blockNumber}'`);
      return null;
    }

    return { blockNumber: receipt.blockNumber, blockTimestamp: new Date(Number(block.timestamp) * 1000) };
  }
}
