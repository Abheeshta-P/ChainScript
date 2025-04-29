import { BlockProps } from "../types/index.js";
import { createHash } from "crypto";


class Block {
  index: number;
  timestamp: string;
  data: string | object;
  previousHash: string;
  hash: string;
  nonce: number;
  constructor(props: BlockProps) {
    this.index = props.index;
    this.timestamp = props.timestamp;
    this.data = props.data;
    this.previousHash = props.previousHash;
    this.hash = props.hash || this.calculateHash();
    this.nonce = props.nonce || 0;
  }

  calculateHash(): string{
   return createHash("sha256") 
     .update(
       this.index +
         this.timestamp.toString() +
         this.data +
         this.previousHash +
         this.nonce
     )
     .digest("hex").toString();
  }
}

class Blockchain {
  private chain: Block[];
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
    this.chain.push(newBlock);
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

console.log(JSON.stringify(arikkaCoin, null, 4));