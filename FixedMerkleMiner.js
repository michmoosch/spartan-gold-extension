"use strict";

const { Miner, utils } = require('spartan-gold');


const SIZE_LIMIT = 1000;

// To do - Everything else

module.exports = class FixedMerkleMiner extends Miner {

    constructor({name, net, startingBlock, keyPair, miningRounds=Blockchain.NUM_ROUNDS_MINING} = {}) {
        super({name, net, startingBlock, keyPair});
        this.miningRounds=miningRounds;
    
        // Set of transactions to be added to the next block.
        this.transactions = new Set();
      }
}