import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("ProofStorage", function () {
  const UUID = "550e8400-e29b-41d4-a716-446655440000";
  const HASH = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2";
  const CID = "QmXnnyufdzAWL5CqZ2RnSNgPbvCc1ALT73s6epPrRnZ1Xy";

  async function deployProofStorage() {
    const [alice, bob] = await ethers.getSigners();
    const proofStorage = await ethers.deployContract("ProofStorage");
    return { proofStorage, alice, bob };
  }

  describe("Deployment", function () {
    it("should set the deployer as owner", async function () {
      const { proofStorage, alice } = await deployProofStorage();

      expect(await proofStorage.owner()).to.equal(alice.address);
    });
  });

  describe("storeProof", function () {
    it("should store a proof and retrieve it", async function () {
      const { proofStorage } = await deployProofStorage();

      await proofStorage.storeProof(UUID, HASH, CID);

      const proof = await proofStorage.getProof(UUID);
      expect(proof.hash).to.equal(HASH);
      expect(proof.cid).to.equal(CID);
    });

    it("should emit a ProofStored event", async function () {
      const { proofStorage, alice } = await deployProofStorage();

      await expect(proofStorage.storeProof(UUID, HASH, CID))
        .to.emit(proofStorage, "ProofStored")
        .withArgs(alice.address, UUID, HASH, CID);
    });

    it("should revert when called by non-owner", async function () {
      const { proofStorage, bob } = await deployProofStorage();

      const bobProofStorage = proofStorage.connect(bob) as typeof proofStorage;

      await expect(bobProofStorage.storeProof(UUID, HASH, CID))
        .to.be.revertedWithCustomError(proofStorage, "NotOwner");
    });

    it("should revert when uuid is empty", async function () {
      const { proofStorage } = await deployProofStorage();

      await expect(proofStorage.storeProof("", HASH, CID))
        .to.be.revertedWithCustomError(proofStorage, "UuidEmpty");
    });

    it("should revert when uuid exceeds max length", async function () {
      const { proofStorage } = await deployProofStorage();
      const longUuid = "550e8400-e29b-41d4-a716-446655440000x";

      await expect(proofStorage.storeProof(longUuid, HASH, CID))
        .to.be.revertedWithCustomError(proofStorage, "UuidTooLong")
        .withArgs(longUuid);
    });

    it("should revert when uuid already exists", async function () {
      const { proofStorage } = await deployProofStorage();

      await proofStorage.storeProof(UUID, HASH, CID);

      await expect(proofStorage.storeProof(UUID, HASH, CID))
        .to.be.revertedWithCustomError(proofStorage, "UuidAlreadyExists")
        .withArgs(UUID);
    });

    it("should revert when hash is empty", async function () {
      const { proofStorage } = await deployProofStorage();

      await expect(proofStorage.storeProof(UUID, "", CID))
        .to.be.revertedWithCustomError(proofStorage, "HashEmpty");
    });

    it("should revert when cid is empty", async function () {
      const { proofStorage } = await deployProofStorage();

      await expect(proofStorage.storeProof(UUID, HASH, ""))
        .to.be.revertedWithCustomError(proofStorage, "CidEmpty");
    });
  });

  describe("getProof", function () {
    it("should revert when uuid is empty", async function () {
      const { proofStorage } = await deployProofStorage();

      await expect(proofStorage.getProof(""))
        .to.be.revertedWithCustomError(proofStorage, "UuidEmpty");
    });

    it("should revert when uuid does not exist", async function () {
      const { proofStorage } = await deployProofStorage();

      await expect(proofStorage.getProof(UUID))
        .to.be.revertedWithCustomError(proofStorage, "UuidNotFound")
        .withArgs(UUID);
    });
  });
});
