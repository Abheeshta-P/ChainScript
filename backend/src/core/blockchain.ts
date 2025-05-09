import { BlockProps, TransactionProps } from "../types/index.js";
import { createHash } from "crypto";
import pkg from "elliptic";
const { ec: EC } = pkg;

const ec = new EC("secp256k1");

export class Transaction {
  fromAddress: string;
  toAddress: string;
  amount: number;
  signature: string;

  constructor({ fromAddress, toAddress, amount }: TransactionProps) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }

  // Sign transaction hash by private key
  calculateHash() {
    return createHash("sha256").update(
      this.fromAddress + this.toAddress + this.amount
    ).digest("hex");
  }

  signTransaction(signingKey) {
    if (signingKey.getPublic("hex") !== this.fromAddress) {
      throw new Error("You cannot sign transactions for other wallets!")
    }

    const hash = this.calculateHash();
    const sig = signingKey.sign(hash, "base64");
    this.signature = sig.toDER("hex");
  }

  // Mining reward, are not signed but valid
  isValid() {
    // mining reward transaction
    if (this.fromAddress === null) return true;

    // no signature
    if (!this.signature || this.signature.length === 0) {
      return new Error("No signature in this transaction");
    }

    // from address is public key
    const publicKey = ec.keyFromPublic(this.fromAddress, "hex");
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

export class Block {
  index: number;
  timestamp: string;
  transactions: any;
  previousHash: string;
  hash: string;
  private nonce: number;
  constructor(props: BlockProps) {
    this.index = props.index;
    this.timestamp = props.timestamp.toString();
    this.transactions = props.transactions;
    this.previousHash = props.previousHash || "";
    this.nonce = props.nonce || 0;
    this.hash = "";
  }

  calculateHash(): string {
    return createHash("sha256")
      .update(
        this.index +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.previousHash +
        this.nonce
      )
      .digest("hex");
  }

  // Mine block
  mineBlock(difficulty: number) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block ${this.index} mined : ` + this.hash);
  }

  // Verify all transaction in current block
  hasValidTransactions() {
    for (const tx of this.transactions) {
      if(!tx.isValid()){
        return false;
      }
    }
    return true;
  }
}

export class Blockchain {
  chain: Block[]; // private
  difficulty: number;
  pendingTransactions: any[];
  miningReward: number;

  constructor(difficulty: number, miningReward: number) {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = difficulty;
    this.pendingTransactions = [];
    this.miningReward = miningReward;
  }

  // Genesis block
  private createGenesisBlock(): Block {
    return new Block({
      timestamp: new Date().toLocaleString(),
      transactions: "Initial block of ChainScript",
      previousHash: "ChainScript soulkka",
    });
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress: string) {
    // add all pending transactions to the newly created block
    if (this.pendingTransactions.length != 0) {
      let block = new Block({
        index: this.chain.length, // proper index
        timestamp: new Date().toLocaleString(),
        transactions: this.pendingTransactions,
        previousHash: this.getLatestBlock().hash, // ensure hash chaining
      });
      console.log(`Block ${block.index} started mining`);
      block.mineBlock(this.difficulty);
      this.chain.push(block);
    }

    // add new transaction to the pending list
    this.pendingTransactions = [
      new Transaction({
        fromAddress: null,
        toAddress: miningRewardAddress,
        amount: this.miningReward,
      }),
    ];
  }

  addTransaction(transaction: Transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Transaction must include from and to address");
    }
    
    if (!transaction.isValid()) {
      throw new Error("Cannot add invalid transactions to chain");
    }

    this.pendingTransactions.push(transaction);
  }

  // get the amount in the transactions
  getBalanceOfAddress(address: string): number {
    let balance = 0;

    // One block has multiple transactions
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        // Sent the amount
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }
        // Recieved the amount
        else if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  // check validity of the chain
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // If it does not have all valid transactions in block
      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

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