// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

contract ProofStorage {
  uint256 public constant UUID_MAX_LENGTH = 36;

  address public immutable owner;

  struct Proof {
    string hash;
    string cid;
  }

  mapping(string uuid => Proof proof) private uuidToProof;

  event ProofStored(address indexed sender, string uuid, string hash, string cid);

  error NotOwner();
  error UuidEmpty();
  error UuidTooLong(string uuid);
  error UuidAlreadyExists(string uuid);
  error UuidNotFound(string uuid);
  error HashEmpty();
  error CidEmpty();

  constructor() {
    owner = msg.sender;
  }

  function storeProof(string memory uuid, string memory hash, string memory cid) external {
    if (msg.sender != owner) {
      revert NotOwner();
    }

    if (bytes(uuid).length == 0) {
      revert UuidEmpty();
    }

    if (bytes(uuid).length > UUID_MAX_LENGTH) {
      revert UuidTooLong(uuid);
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
    if (bytes(uuid).length == 0) {
      revert UuidEmpty();
    }

    Proof memory proof = uuidToProof[uuid];

    if (bytes(proof.hash).length == 0) {
      revert UuidNotFound(uuid);
    }

    return proof;
  }
}
