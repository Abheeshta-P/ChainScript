import { BlockProps } from "../types/index.js";
import { SHA_256 } from "crypto-js";

class Block {
  index: number;
  timestamp: Date;
  data: string;
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
    return SHA_256(
      this.index +
      this.timestamp.toString() +
      this.data +
      this.previousHash +
      this.nonce
    ).toString();
  }
}