// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

contract ProofStorage {
  uint256 public constant UUID_LENGTH = 36;

  address public immutable owner;

  struct ProofEntry {
    string uuid;
    string hash;
    string cid;
  }

  struct Proof {
    string hash;
    string cid;
  }

  mapping(string uuid => Proof proof) private uuidToProof;

  event ProofStored(address indexed sender, string uuid, string hash, string cid);

  error NotOwner();
  error UuidInvalidLength(string uuid);
  error UuidAlreadyExists(string uuid);
  error UuidNotFound(string uuid);
  error HashEmpty();
  error CidEmpty();

  constructor() {
    owner = msg.sender;
  }

  function storeProofs(ProofEntry[] calldata proofEntries) external {
    if (msg.sender != owner) {
      revert NotOwner();
    }

    for (uint256 i = 0; i < proofEntries.length; i++) {
      ProofEntry calldata p = proofEntries[i];
      storeProof(p.uuid, p.hash, p.cid);
    }
  }

  function storeProof(string memory uuid, string memory hash, string memory cid) private {
    if (bytes(uuid).length != UUID_LENGTH) {
      revert UuidInvalidLength(uuid);
    }

    if (bytes(uuidToProof[uuid].hash).length != 0) {
      revert UuidAlreadyExists(uuid);
    }

    if (bytes(hash).length == 0) {
      revert HashEmpty();
    }

    if (bytes(cid).length == 0) {
      revert CidEmpty();
    }

    uuidToProof[uuid] = Proof(hash, cid);

    emit ProofStored(msg.sender, uuid, hash, cid);
  }

  function getProofByUuid(string memory uuid) external view returns (Proof memory) {
    Proof memory proof = uuidToProof[uuid];

    if (bytes(proof.hash).length == 0) {
      revert UuidNotFound(uuid);
    }

    return proof;
  }
}
