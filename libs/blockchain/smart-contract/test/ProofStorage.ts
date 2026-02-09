/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { expect } from 'chai';
import { network } from 'hardhat';

const { ethers } = await network.connect();

describe('ProofStorage', function () {
  const SUCCESS = 'success';
  const FAILURE = 'failure';

  const UUID_1 = '550e8400-e29b-41d4-a716-446655440000';
  const UUID_2 = '550e8400-e29b-41d4-a716-446655440001';
  const HASH_1 = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';
  const HASH_2 = 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3';
  const CID_1 = 'QmXnnyufdzAWL5CqZ2RnSNgPbvCc1ALT73s6epPrRnZ1Xy';
  const CID_2 = 'QmYnnyufdzAWL5CqZ2RnSNgPbvCc1ALT73s6epPrRnZ1Xz';
  const PROOF_ENTRY_1 = { uuid: UUID_1, hash: HASH_1, cid: CID_1 };
  const PROOF_ENTRY_2 = { uuid: UUID_2, hash: HASH_2, cid: CID_2 };

  async function deployProofStorage() {
    const [alice, bob] = await ethers.getSigners();
    const proofStorage = await ethers.deployContract('ProofStorage');
    return { proofStorage, alice, bob };
  }

  describe('deployment', function () {
    describe(SUCCESS, function () {
      it('should set the deployer as owner', async function () {
        // act
        const { proofStorage, alice } = await deployProofStorage();

        // assert
        expect(await proofStorage.owner()).to.equal(alice.address);
      });

      it('should have UUID_LENGTH constant set to 36', async function () {
        // act
        const { proofStorage } = await deployProofStorage();

        // assert
        expect(await proofStorage.UUID_LENGTH()).to.equal(36);
      });
    });

    describe('failure', function () {
      // no failure cases for deployment
    });
  });

  describe('storeProofs', function () {
    describe(SUCCESS, function () {
      it('should store a single proof', async function () {
      // arrange
        const { proofStorage } = await deployProofStorage();

        // act
        await proofStorage.storeProofs([PROOF_ENTRY_1]);

        // assert
        const proof = await proofStorage.getProofByUuid(UUID_1);
        expect(proof.hash).to.equal(HASH_1);
        expect(proof.cid).to.equal(CID_1);
      });

      it('should store multiple proofs', async function () {
        // arrange
        const { proofStorage } = await deployProofStorage();

        // act
        await proofStorage.storeProofs([PROOF_ENTRY_1, PROOF_ENTRY_2]);

        // assert
        const proof1 = await proofStorage.getProofByUuid(UUID_1);
        expect(proof1.hash).to.equal(HASH_1);
        expect(proof1.cid).to.equal(CID_1);

        const proof2 = await proofStorage.getProofByUuid(UUID_2);
        expect(proof2.hash).to.equal(HASH_2);
        expect(proof2.cid).to.equal(CID_2);
      });

      it('should emit a ProofStored event for each proof', async function () {
      // arrange
        const { proofStorage, alice } = await deployProofStorage();

        // act & assert
        await expect(proofStorage.storeProofs([PROOF_ENTRY_1, PROOF_ENTRY_2]))
          .to.emit(proofStorage, 'ProofStored').withArgs(alice.address, UUID_1, HASH_1, CID_1)
          .and.to.emit(proofStorage, 'ProofStored').withArgs(alice.address, UUID_2, HASH_2, CID_2);
      });
    });

    describe(FAILURE, function () {
      it('should revert when called by non-owner', async function () {
        // arrange
        const { proofStorage, bob } = await deployProofStorage();
        const bobProofStorage = proofStorage.connect(bob) as typeof proofStorage;

        // act & assert
        await expect(bobProofStorage.storeProofs([PROOF_ENTRY_1]))
          .to.be.revertedWithCustomError(proofStorage, 'NotOwner');
      });

      it('should revert when uuid is too short', async function () {
        // arrange
        const { proofStorage } = await deployProofStorage();
        const shortUuid = '550e8400-e29b-41d4-a716-44665544000'; // 1 character short

        // act & assert
        await expect(proofStorage.storeProofs([{ uuid: shortUuid, hash: HASH_1, cid: CID_1 }]))
          .to.be.revertedWithCustomError(proofStorage, 'UuidInvalidLength')
          .withArgs(shortUuid);
      });

      it('should revert when uuid is too long', async function () {
        // arrange
        const { proofStorage } = await deployProofStorage();
        const longUuid = '550e8400-e29b-41d4-a716-446655440000x'; // 1 character long

        // act & assert
        await expect(proofStorage.storeProofs([{ uuid: longUuid, hash: HASH_1, cid: CID_1 }]))
          .to.be.revertedWithCustomError(proofStorage, 'UuidInvalidLength')
          .withArgs(longUuid);
      });

      it('should revert when uuid already exists', async function () {
        // arrange
        const { proofStorage } = await deployProofStorage();
        await proofStorage.storeProofs([PROOF_ENTRY_1]);

        // act & assert
        await expect(proofStorage.storeProofs([PROOF_ENTRY_1]))
          .to.be.revertedWithCustomError(proofStorage, 'UuidAlreadyExists').withArgs(UUID_1);
      });

      it('should revert when hash is empty', async function () {
        // arrange
        const { proofStorage } = await deployProofStorage();

        // act & assert
        await expect(proofStorage.storeProofs([{ uuid: UUID_1, hash: '', cid: CID_1 }]))
          .to.be.revertedWithCustomError(proofStorage, 'HashEmpty');
      });

      it('should revert when cid is empty', async function () {
        // arrange
        const { proofStorage } = await deployProofStorage();

        // act & assert
        await expect(proofStorage.storeProofs([{ uuid: UUID_1, hash: HASH_1, cid: '' }]))
          .to.be.revertedWithCustomError(proofStorage, 'CidEmpty');
      });

      it('should revert entire batch when one entry is invalid', async function () {
      // arrange
        const { proofStorage } = await deployProofStorage();

        // act & assert
        await expect(
          proofStorage.storeProofs([PROOF_ENTRY_1, { uuid: UUID_2, hash: '', cid: CID_2 }]))
          .to.be.revertedWithCustomError(proofStorage, 'HashEmpty');

        // first entry should not have been persisted
        await expect(proofStorage.getProofByUuid(UUID_1))
          .to.be.revertedWithCustomError(proofStorage, 'UuidNotFound');
      });
    });
  });

  describe('getProofByUuid', function () {
    describe(SUCCESS, function () {
      // see happy path test in "storeProofs" section
    });

    describe(FAILURE, function () {
      it('should revert when uuid is empty', async function () {
        // arrange
        const { proofStorage } = await deployProofStorage();

        // act & assert
        await expect(proofStorage.getProofByUuid(''))
          .to.be.revertedWithCustomError(proofStorage, 'UuidNotFound');
      });

      it('should revert when uuid does not exist', async function () {
        // arrange
        const { proofStorage } = await deployProofStorage();

        // act & assert
        await expect(proofStorage.getProofByUuid(UUID_1))
          .to.be.revertedWithCustomError(proofStorage, 'UuidNotFound').withArgs(UUID_1);
      });
    });
  });
});
