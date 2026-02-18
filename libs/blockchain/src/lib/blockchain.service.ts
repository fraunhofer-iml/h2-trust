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
  readonly enabled: boolean;
  readonly rpcUrl: string;
  readonly smartContractAddress: string;
  readonly explorerUrl: string;

  private readonly logger = new Logger(this.constructor.name);
  private readonly contract: ProofStorageContract;

  constructor(private readonly configurationService: ConfigurationService) {
    this.enabled = this.configurationService.getGlobalConfiguration().blockchain.enabled;
    this.rpcUrl = this.enabled ? this.configurationService.getGlobalConfiguration().blockchain.rpcUrl : null;
    this.smartContractAddress = this.enabled
      ? this.configurationService.getGlobalConfiguration().blockchain.smartContractAddress
      : null;
    this.explorerUrl = this.enabled ? this.configurationService.getGlobalConfiguration().blockchain.explorerUrl : null;

    if (this.enabled) {
      this.logger.debug('🔗 Blockchain is enabled. Proofs will be stored and retrieved.');
      this.logger.debug(`🌐 RPC URL: ${this.rpcUrl}`);
      this.logger.debug(`📄 Smart Contract Address: ${this.smartContractAddress}`);
      this.logger.debug(`🧭 Explorer URL: ${this.explorerUrl}`);

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
    if (!this.enabled) {
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
    if (!this.enabled) {
      this.logger.debug(`⏭️ Blockchain disabled, skipping proof retrieval for ${uuid}`);
      return null;
    }

    this.logger.debug(`🔍 Retrieving proof: ${uuid}`);

    const proof: Proof = await this.contract.getProofByUuid(uuid);
    this.logger.debug(`✅ Proof retrieved: ${JSON.stringify(proof)}`);

    return new ProofEntity(uuid, proof.hash, proof.cid);
  }

  async retrieveBlockchainMetadata(transactionHash: string): Promise<BlockchainMetadata> {
    if (!this.enabled || !this.contract) {
      return null;
    }

    const receipt = await this.contract.runner.provider.getTransactionReceipt(transactionHash);

    if (!receipt) {
      return null;
    }

    const block = await this.contract.runner.provider.getBlock(receipt.blockNumber);

    if (!block) {
      return null;
    }

    return { blockNumber: receipt.blockNumber, blockTimestamp: new Date(Number(block.timestamp) * 1000) };
  }
}
