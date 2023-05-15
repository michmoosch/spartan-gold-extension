"use strict";

const { Miner, utils } = require('spartan-gold');
let Blockchain = require('./blockchain.js');



// To do - Everything else

module.exports = class FixedMerkleMiner extends Miner {

    constructor({name, net, startingBlock, keyPair, miningRounds=Blockchain.NUM_ROUNDS_MINING} = {}) {
        super({name, net, startingBlock, keyPair});
        this.miningRounds=miningRounds;
    
        // Set of transactions to be added to the next block.
        this.transactions = new Set();
      }

      // announceProof(){
      //   console.log(this.currentBlock.merkleTree.display())
      //   this.net.broadcast(Blockchain.PROOF_FOUND, this.currentBlock);
      // }
}