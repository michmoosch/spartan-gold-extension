"use strict";

const { Transaction, utils } = require("spartan-gold");

const SIZE_LIMIT = 1000;

// To do - Everything else

module.exports = class FixedMerkleTransaction extends Transaction {
  /**
   * The constructor calls the parent constructor
   */
  constructor({ from, nonce, pubKey, sig, outputs, fee = 0, data = {} }) {
    super({ from, nonce, pubKey, sig, outputs, fee, data });
    // this.size = Buffer.from(this.id).length;
    // console.log("Size: " + this.size);
    // console.log("TotalOutput: " + this.totalOutput());
    // console.log("Fee: " + this.fee);
    // Add other stuff
  }
};
