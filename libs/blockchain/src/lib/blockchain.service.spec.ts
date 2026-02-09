/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ProofEntity } from '@h2-trust/amqp';
import { ConfigurationService } from '@h2-trust/configuration';
import { BlockchainService } from './blockchain.service';

jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    readFileSync: jest.fn().mockReturnValue(JSON.stringify({ abi: [] })),
}));

const mockWait = jest.fn();
const mockStoreProof = jest.fn();
const mockGetProofByUuid = jest.fn();

jest.mock('ethers', () => {
    const original = jest.requireActual('ethers');
    return {
        ...original,
        JsonRpcProvider: jest.fn(),
        Wallet: jest.fn(),
        NonceManager: jest.fn(),
        Contract: jest.fn().mockImplementation(() => ({
            storeProof: mockStoreProof,
            getProofByUuid: mockGetProofByUuid,
        })),
    };
});

describe('BlockchainService', () => {
    let service: BlockchainService;

    const configurationServiceMock = {
        getGlobalConfiguration: jest.fn().mockReturnValue({
            blockchain: {
                rpcUrl: 'http://localhost:8545',
                privateKey: '0xprivatekey',
                artifactPath: '/path/to/artifact.json',
                smartContractAddress: '0x1234567890abcdef',
            },
        }),
    };

    beforeEach(async () => {
        mockWait.mockResolvedValue(undefined);
        mockStoreProof.mockResolvedValue({ hash: 'txHash', wait: mockWait });
        mockGetProofByUuid.mockResolvedValue({ hash: 'proofHash', cid: 'Qm123' });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BlockchainService,
                {
                    provide: ConfigurationService,
                    useValue: configurationServiceMock,
                },
            ],
        }).compile();

        service = module.get<BlockchainService>(BlockchainService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('reads the blockchain configuration', () => {
            // Assert
            expect(configurationServiceMock.getGlobalConfiguration).toHaveBeenCalled();
        });

        it('creates the contract with correct address and ABI', () => {
            // Assert
            const { Contract } = jest.requireMock('ethers');
            expect(Contract).toHaveBeenCalledWith('0x1234567890abcdef', [], expect.anything());
        });

        it('reads the ABI from the configured artifact path', () => {
            // Assert
            const { readFileSync } = jest.requireMock('fs');
            expect(readFileSync).toHaveBeenCalledWith('/path/to/artifact.json', 'utf-8');
        });

        it('sets up provider, wallet and NonceManager', () => {
            // Assert
            const { JsonRpcProvider, Wallet, NonceManager } = jest.requireMock('ethers');            
            expect(JsonRpcProvider).toHaveBeenCalledWith('http://localhost:8545');
            expect(Wallet).toHaveBeenCalledWith('0xprivatekey', expect.anything());
            expect(NonceManager).toHaveBeenCalledWith(expect.anything());
        });
    });

    describe('storeProof', () => {
        it('calls contract with correct arguments and returns transaction hash', async () => {
            // Arrange
            const givenProof = new ProofEntity('uuid-1', 'hash-1', 'cid-1');

            // Act
            const actualResult = await service.storeProof(givenProof);

            // Assert
            expect(mockStoreProof).toHaveBeenCalledWith('uuid-1', 'hash-1', 'cid-1');
            expect(mockWait).toHaveBeenCalled();
            expect(actualResult).toBe('txHash');
        });

        it('propagates contract errors', async () => {
            // Arrange
            mockStoreProof.mockRejectedValue(new Error('transaction reverted'));
            const givenProof = new ProofEntity('uuid-1', 'hash-1', 'cid-1');

            // Act & Assert
            await expect(service.storeProof(givenProof)).rejects.toThrow('transaction reverted');
        });

        it('propagates errors when waiting for tx confirmation', async () => {
            // Arrange
            mockWait.mockRejectedValue(new Error('tx not mined'));
            const givenProof = new ProofEntity('uuid-1', 'hash-1', 'cid-1');

            // Act & Assert
            await expect(service.storeProof(givenProof)).rejects.toThrow('tx not mined');
        });
    });

    describe('getProofByUuid', () => {
        it('returns a ProofEntity with the retrieved data', async () => {
            // Arrange
            const givenUuid = 'uuid-1';

            // Act
            const actualResult = await service.getProofByUuid(givenUuid);

            // Assert
            expect(mockGetProofByUuid).toHaveBeenCalledWith(givenUuid);
            expect(actualResult).toBeInstanceOf(ProofEntity);
            expect(actualResult.uuid).toBe('uuid-1');
            expect(actualResult.hash).toBe('proofHash');
            expect(actualResult.cid).toBe('Qm123');
        });

        it('propagates contract errors', async () => {
            // Arrange
            mockGetProofByUuid.mockRejectedValue(new Error('call exception'));

            // Act & Assert
            await expect(service.getProofByUuid('uuid-1')).rejects.toThrow('call exception');
        });
    });
});
