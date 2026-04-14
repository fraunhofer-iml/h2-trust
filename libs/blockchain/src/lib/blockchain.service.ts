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
  readonly verificationEnabled: boolean;
  readonly endpointUrl?: string;
  readonly smartContractAddress?: string;
  readonly explorerUrl?: string;

  private readonly contract?: ProofStorageContract;
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly configurationService: ConfigurationService) {
    const blockchainConfiguration = this.configurationService.getGlobalConfiguration().blockchain;
    const featureFlags = this.configurationService.getGlobalConfiguration().featureFlags;

    this.verificationEnabled = featureFlags.verificationEnabled;

    if (this.verificationEnabled) {
      this.endpointUrl = blockchainConfiguration.endpointUrl;
      this.smartContractAddress = blockchainConfiguration.smartContractAddress;
      this.explorerUrl = blockchainConfiguration.explorerUrl;

      this.logger.debug('🔗 Verification feature is enabled. Proofs will be stored and retrieved.');
      this.logger.debug(`🌐 Endpoint URL: ${this.endpointUrl}`);
      this.logger.debug(`🧭 Explorer URL: ${this.explorerUrl}`);
      this.logger.debug(`📄 Smart Contract Address: ${this.smartContractAddress}`);

      this.contract = this.createContract(blockchainConfiguration.artifactPath, blockchainConfiguration.privateKey);
    } else {
      this.logger.debug('⛓️‍💥 Verification feature is disabled. Proofs will not be stored on a blockchain.');
    }
  }

  private createContract(artifactPath: string, privateKey: string): ProofStorageContract {
    const { abi } = JSON.parse(readFileSync(artifactPath, 'utf-8'));

    const provider = new JsonRpcProvider(this.endpointUrl);
    const wallet = new Wallet(privateKey, provider);
    const signer = new NonceManager(wallet);

    return new Contract(this.smartContractAddress, abi, signer) as unknown as ProofStorageContract;
  }

  async storeProofs(proofEntries: ProofEntry[]): Promise<string | null> {
    if (!this.verificationEnabled) {
      this.logger.debug(`⏭️ Verification feature disabled, skipping proof storage of ${proofEntries.length} entries`);
      return null;
    }

    this.logger.debug(`📝 Storing proofs:\n${proofEntries.map((e) => JSON.stringify(e)).join('\n')}`);

    const tx = await this.contract.storeProofs(proofEntries);
    await tx.wait();

    this.logger.debug(`✅ Proof stored: ${tx.hash}`);
    return tx.hash;
  }

  async retrieveProof(uuid: string): Promise<ProofEntity | null> {
    if (!this.verificationEnabled) {
      this.logger.debug(`⏭️ Verification feature disabled, skipping proof retrieval for ${uuid}`);
      return null;
    }

    this.logger.debug(`🔍 Retrieving proof: ${uuid}`);

    try {
      const proof: Proof = await this.contract.getProofByUuid(uuid);
      this.logger.debug(`✅ Proof retrieved: ${JSON.stringify(proof)}`);
      return new ProofEntity(uuid, proof.hash, proof.cid);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const message = `❌ Error retrieving proof for ${uuid}: ${errorMessage}`;
      this.logger.error(message, error instanceof Error ? error.stack : undefined);
      return null;
    }
  }

  async retrieveBlockchainMetadata(transactionHash: string): Promise<BlockchainMetadata | null> {
    if (!this.verificationEnabled) {
      this.logger.debug(`⏭️ Verification feature disabled, skipping metadata retrieval for ${transactionHash}`);
      return null;
    }

    const receipt = await this.contract.runner.provider.getTransactionReceipt(transactionHash);

    if (!receipt) {
      this.logger.debug(`⏭️ Transaction receipt not found for ${transactionHash}`);
      return null;
    }

    const block = await this.contract.runner.provider.getBlock(receipt.blockNumber);

    if (!block) {
      this.logger.debug(`⏭️ Block not found for ${receipt.blockNumber}`);
      return null;
    }

    return { blockNumber: receipt.blockNumber, blockTimestamp: new Date(Number(block.timestamp) * 1000) };
  }
}
