// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

contract ProofStorage {
  address public immutable owner;

  struct Proof {
    string hash;
    string cid;
  }

  mapping(string hash => string cid) private hashToCid;

  event ProofStored(address indexed sender, string hash, string cid);

  error NotOwner();
  error HashEmpty();
  error HashAlreadyExists(string hash);
  error HashNotFound(string hash);
  error CidEmpty();

  constructor() {
    owner = msg.sender;
  }

  function storeProofs(Proof[] calldata proofs) external {
    if (msg.sender != owner) {
      revert NotOwner();
    }

    for (uint256 i = 0; i < proofs.length; i++) {
      Proof calldata p = proofs[i];
      storeProof(p.hash, p.cid);
    }
  }

  function storeProof(string memory hash, string memory cid) private {
    if (bytes(hash).length == 0) {
      revert HashEmpty();
    }

    if (bytes(cid).length == 0) {
      revert CidEmpty();
    }

    if (bytes(hashToCid[hash]).length != 0) {
      revert HashAlreadyExists(hash);
    }

    hashToCid[hash] = cid;

    emit ProofStored(msg.sender, hash, cid);
  }

  function getCidByHash(string memory hash) external view returns (string memory) {
    string memory cid = hashToCid[hash];

    if (bytes(cid).length == 0) {
      revert HashNotFound(hash);
    }

    return cid;
  }
}
