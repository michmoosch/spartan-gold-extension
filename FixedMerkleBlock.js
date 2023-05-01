"use strict";

const { Block, utils } = require('spartan-gold');

const BigInteger = require('jsbn').BigInteger;


module.exports = class FixedMerkleBlock extends Block {

  /**
   * The constructor calls the parent constructor
   */
  constructor(rewardAddr, prevBlock, target, coinbaseReward) {
    super(rewardAddr, prevBlock, target, coinbaseReward);

    // Add other stuff
  }

  /**
   * This method tracks the information about coin age, including adjusting
   * the proof-of-work target based on the coin age of the miner.
   * 
   * @param {CoinAgeBlock} prevBlock - The block that this block extends from.
   */
  updateCoinAgeBalances(prevBlock) {
    this.coinAgeBalances = prevBlock ? new Map(prevBlock.coinAgeBalances) : new Map();

    //
    // ***YOUR CODE HERE***
    //
    // First, increase the coin age balances for all clients
    // by the amount of coins currently held.  (The amount
    // of coins currently held are available in the Map
    // prevBlock.balances).
    //
    // Update the target according to the miner's coin age,
    // and set the miner's coin age to 0.  In order to adjust
    // the target, you may want to use the 'shiftLeft' method
    // of the BigInteger class (https://www.npmjs.com/package/big-integer):
    //
    // The following line will double the size of this.adjustedTarget:
    //
    //    this.adjustedTarget = this.adjustedTarget.shiftLeft(1);
  }

  /**
   * Add a transaction to the block, also setting the coin age for the
   * 'from' address to 0.
   * 
   * @param {Transaction} tx - the transaction being added to the block.
   * @param {Client} client - The client can be used to print out debugging messages.
   */
  addTransaction(tx, client) {
    let success = super.addTransaction(tx, client);
    if (success) {
      this.coinAgeBalances.set(tx.from, 0);
    }
    return success;
  }

  /**
   * This method is nearly identical to the parent class,
   * except that an adjusted PoW target is used instead
   * of the base PoW target.
   */
  hasValidProof() {
    let h = utils.hash(this.serialize());
    let n = new BigInteger(h, 16);
    return n.compareTo(this.adjustedTarget) < 0;
  }

  /**
   * Returns the coin age for the specified account.
   */
  coinAgeOf(addr) {
    return this.coinAgeBalances.get(addr) || 0;
  }

  /**
   * Replays a block to make sure that all of the values are correct.
   * 
   * @param {Block} prevBlock - The block that this block builds on.
   */
  rerun(prevBlock) {
    this.updateCoinAgeBalances(prevBlock);

    return super.rerun(prevBlock);
  }

  /**
   * The serialized form of this object must include the adjusted
   * PoW target.
   */
  toJSON() {
    let o = {
      chainLength: this.chainLength,
      timestamp: this.timestamp,
    };
    if (this.isGenesisBlock()) {
      // The genesis block does not contain a proof or transactions,
      // but is the only block than can specify balances.
      o.balances = Array.from(this.balances.entries());
    } else {
      // Other blocks must specify transactions and proof details.
      o.transactions = Array.from(this.transactions.entries());
      o.prevBlockHash = this.prevBlockHash;
      o.proof = this.proof;
      o.rewardAddr = this.rewardAddr;
      o.adjustedTarget = this.adjustedTarget;
    }
    return o;
  }
  
}
