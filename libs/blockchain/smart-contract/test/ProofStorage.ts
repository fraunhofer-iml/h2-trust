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

  const HASH_1 = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';
  const HASH_2 = 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3';
  const CID_1 = 'QmXnnyufdzAWL5CqZ2RnSNgPbvCc1ALT73s6epPrRnZ1Xy';
  const CID_2 = 'QmYnnyufdzAWL5CqZ2RnSNgPbvCc1ALT73s6epPrRnZ1Xz';
  const PROOF_1 = { hash: HASH_1, cid: CID_1 };
  const PROOF_2 = { hash: HASH_2, cid: CID_2 };

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
        await proofStorage.storeProofs([PROOF_1]);

        // assert
        const cid = await proofStorage.getCidByHash(HASH_1);
        expect(cid).to.equal(CID_1);
      });

      it('should store multiple proofs', async function () {
        // arrange
        const { proofStorage } = await deployProofStorage();

        // act
        await proofStorage.storeProofs([PROOF_1, PROOF_2]);

        // assert
        const cid1 = await proofStorage.getCidByHash(HASH_1);
        expect(cid1).to.equal(CID_1);

        const cid2 = await proofStorage.getCidByHash(HASH_2);
        expect(cid2).to.equal(CID_2);
      });

      it('should emit a ProofStored event for each proof', async function () {
        // arrange
        const { proofStorage, alice } = await deployProofStorage();

        // act & assert
        await expect(proofStorage.storeProofs([PROOF_1, PROOF_2]))
          .to.emit(proofStorage, 'ProofStored')
          .withArgs(alice.address, HASH_1, CID_1)
          .and.to.emit(proofStorage, 'ProofStored')
          .withArgs(alice.address, HASH_2, CID_2);
      });
    });

    describe(FAILURE, function () {
      it('should revert when called by non-owner', async function () {
        // arrange
        const { proofStorage, bob } = await deployProofStorage();
        const bobProofStorage = proofStorage.connect(bob) as typeof proofStorage;

        // act & assert
        await expect(bobProofStorage.storeProofs([PROOF_1])).to.be.revertedWithCustomError(
          proofStorage,
          'NotOwner',
        );
      });

      it('should revert when hash already exists', async function () {
        // arrange
        const { proofStorage } = await deployProofStorage();
        await proofStorage.storeProofs([PROOF_1]);

        // act & assert
        await expect(proofStorage.storeProofs([PROOF_1]))
          .to.be.revertedWithCustomError(proofStorage, 'HashAlreadyExists')
          .withArgs(HASH_1);
      });

      it('should revert when hash is empty', async function () {
        // arrange
        const { proofStorage } = await deployProofStorage();

        // act & assert
        await expect(proofStorage.storeProofs([{ hash: '', cid: CID_1 }])).to.be.revertedWithCustomError(
          proofStorage,
          'HashEmpty',
        );
      });

      it('should revert entire batch when one entry is invalid', async function () {
        // arrange
        const { proofStorage } = await deployProofStorage();

        // act & assert
        await expect(
          proofStorage.storeProofs([PROOF_1, { hash: '', cid: CID_2 }]),
        ).to.be.revertedWithCustomError(proofStorage, 'HashEmpty');

        // first entry should not have been persisted
        await expect(proofStorage.getCidByHash(HASH_1)).to.be.revertedWithCustomError(proofStorage, 'HashNotFound');
      });
    });
  });

  describe('getCidByHash', function () {
    describe(SUCCESS, function () {
      // see happy path test in "storeProofs" section
    });

    describe(FAILURE, function () {
      it('should revert when hash is empty', async function () {
        // arrange
        const { proofStorage } = await deployProofStorage();

        // act & assert
        await expect(proofStorage.getCidByHash('')).to.be.revertedWithCustomError(proofStorage, 'HashNotFound');
      });

      it('should revert when hash does not exist', async function () {
        // arrange
        const { proofStorage } = await deployProofStorage();

        // act & assert
        await expect(proofStorage.getCidByHash(HASH_1))
          .to.be.revertedWithCustomError(proofStorage, 'HashNotFound')
          .withArgs(HASH_1);
      });
    });
  });
});
