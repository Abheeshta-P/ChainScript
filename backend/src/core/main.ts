import { BlockProps } from "../types/index.js";
import { createHash } from "crypto";


class Block {
  private index: number;
  private timestamp: string;
  private data: any;
  previousHash: string;
  hash: string;
  private nonce: number;
  constructor(props: BlockProps) {
    this.index = props.index;
    this.timestamp = props.timestamp.toString();
    this.data = props.data;
    this.previousHash = props.previousHash || "";
    this.nonce = props.nonce || 0;
    this.hash = "";
  }

  calculateHash(): string{
    return createHash("sha256")
      .update(
        this.index +
        this.timestamp +
        JSON.stringify(this.data) +
        this.previousHash +
        this.nonce
      )
      .digest("hex");
  }
}

class Blockchain {
  chain: Block[]; // private
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  // Genesis block
  private createGenesisBlock():Block {
    return new Block({ index: 0, timestamp: new Date().toLocaleString(), data: "Initial block of ChainScript", previousHash: "ChainScript soulkka" });
  }

  getLatestBlock():Block {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock:Block) {
    newBlock.previousHash = this.chain[this.chain.length - 1].hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  // check validity of the chain
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++){
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // If the data in the block was changed
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // Block integrity in a blockchain
      if (currentBlock.previousHash !== previousBlock.hash) {
         return false;
      }

    }
    return true;
  }
}

let arikkaCoin = new Blockchain();

arikkaCoin.addBlock(
  new Block({
    index: 1,
    timestamp: new Date().toLocaleString(),
    data: { message: "Transferred 9-arikka from Abhee to Sarika", amount: 9 },
  })
);
arikkaCoin.addBlock(
  new Block({
    index: 2,
    timestamp: new Date().toLocaleString(),
    data: { message: "Transferred 25-arikka from Sarika to Abhee", amount: 25 },
  })
);

// Blockchain
console.log(JSON.stringify(arikkaCoin, null, 4));
// Is the blockchain valid
console.log(arikkaCoin.isChainValid());

// Cannot change
arikkaCoin.chain[1].hash = "gjkdjfghkgh";
arikkaCoin.chain[1].calculateHash();
console.log(arikkaCoin.isChainValid());