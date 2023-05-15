"use strict";

const { Block, utils } = require("spartan-gold");

const BigInteger = require("jsbn").BigInteger;

const { FixedMerkleTransaction } = require("./FixedMerkleTransaction.js");
const { MerkleTree } = require("./MerkleTree.js");

module.exports = class FixedMerkleBlock extends Block {
  /**
   * The constructor calls the parent constructor
   */
  constructor(rewardAddr, prevBlock, target, coinbaseReward, blockSize = 3) {
    super(rewardAddr, prevBlock, target, coinbaseReward);
    this.blockSize = blockSize;
    this.transactions = new Map();
    this.merkleTree = null;
  }

  /**
   * Accepts a new transaction if it is valid and adds it to the block.
   *
   * @param {Transaction} tx - The transaction to add to the block.
   * @param {Client} [client] - A client object, for logging useful messages.
   *
   * @returns {Boolean} - True if the transaction was added successfully.
   */
  addTransaction(tx, client) {
    if (this.transactions.get(tx.id)) {
      if (client) client.log(`Duplicate transaction ${tx.id}.`);
      return false;
    } else if (tx.sig === undefined) {
      if (client) client.log(`Unsigned transaction ${tx.id}.`);
      return false;
    } else if (!tx.validSignature()) {
      if (client) client.log(`Invalid signature for transaction ${tx.id}.`);
      return false;
    } else if (!tx.sufficientFunds(this)) {
      if (client) client.log(`Insufficient gold for transaction ${tx.id}.`);
      return false;
    }

    // Checking and updating nonce value.
    // This portion prevents replay attacks.
    let nonce = this.nextNonce.get(tx.from) || 0;
    if (tx.nonce < nonce) {
      if (client) client.log(`Replayed transaction ${tx.id}.`);
      return false;
    } else if (tx.nonce > nonce) {
      // FIXME: Need to do something to handle this case more gracefully.
      if (client) client.log(`Out of order transaction ${tx.id}.`);
      return false;
    } else {
      this.nextNonce.set(tx.from, nonce + 1);
    }

    // **** New check for block size ****
    if (this.transactions.size >= this.blockSize) {
      let flag = true;
      if (client) client.log(`Block is full... Prioritizing transactions...`);

      // Check for lower value transactions to be replaced
      this.transactions.forEach((old_tx) => {
        if (old_tx.totalOutput() < tx.totalOutput() && flag) {
          if (client) {
            client.log(
              `Removing transaction ${
                old_tx.id
              } | Value: ${old_tx.totalOutput()}.`
            );
            client.log(
              `Adding transaction ${tx.id} | Value: ${tx.totalOutput()}.`
            );
          }

          this.transactions.delete(old_tx.id);
          this.transactions.set(tx.id, tx);
          flag = false;
        }
      });

      // If block is full, and no lower value transactions are found, transaction is not added.
      if (flag) {
        if (client) client.log(`Transaction ${tx.id} not added to block.`);
        return false;
      }
    }

    // Adding the transaction to the block
    this.transactions.set(tx.id, tx);
    this.merkleTree = new MerkleTree([...this.transactions.keys()]);

    

    // Taking gold from the sender
    let senderBalance = this.balanceOf(tx.from);
    this.balances.set(tx.from, senderBalance - tx.totalOutput());

    // Giving gold to the specified output addresses
    tx.outputs.forEach(({ amount, address }) => {
      let oldBalance = this.balanceOf(address);
      this.balances.set(address, amount + oldBalance);
    });

    this.merkleTree.display();
    return true;
  }

  contains(tx){
    if(this.merkleTree === null){
      return false;
    }
    return this.merkleTree.contains(tx.id);
  }

  rerun(prevBlock) {
    // Setting balances to the previous block's balances.
    this.balances = new Map(prevBlock.balances);
    this.nextNonce = new Map(prevBlock.nextNonce);

    // Adding coinbase reward for prevBlock.
    let winnerBalance = this.balanceOf(prevBlock.rewardAddr);
    if (prevBlock.rewardAddr) this.balances.set(prevBlock.rewardAddr, winnerBalance + prevBlock.totalRewards());

    // Re-adding all transactions.
    let txs = this.transactions;
    this.transactions = new Map();
    for (let tx of txs.values()) {
      let success = this.addTransaction(tx);
      // if (!success) return false;
    }

    return true;
  }


  
};
