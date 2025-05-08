import { BlockProps } from "../types/index.js";
import { createHash } from "crypto";

type TransactionProps = {
  fromAddress: string;
  toAddress: string;
  amount: number;
}

class Transaction {
  fromAddress: string;
  toAddress: string;
  amount: number;

  constructor({ fromAddress, toAddress, amount }: TransactionProps) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
}

class Block {
  index = 0;
  timestamp: string;
  transactions: any;
  previousHash: string;
  hash: string;
  private nonce: number;
  constructor(props: BlockProps) {
    this.index = this.index++;
    this.timestamp = props.timestamp.toString();
    this.transactions = props.transactions;
    this.previousHash = props.previousHash || "";
    this.nonce = props.nonce || 0;
    this.hash = "";
  }

  calculateHash(): string{
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
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block ${this.index} mined : ` + this.hash);
  }
}


class Blockchain {
  private chain: Block[]; // private
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
          timestamp: new Date().toLocaleString(),
          transactions: this.pendingTransactions,
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

  createTransaction(transaction: TransactionProps) {
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

let arikkaCoin = new Blockchain(2,100);
arikkaCoin.createTransaction(new Transaction({ fromAddress: "address 5", toAddress: "address 8", amount: 9 }));
arikkaCoin.createTransaction(new Transaction({ fromAddress: "address 8", toAddress: "address 5", amount: 25 }));

// Usually miners themself take up transactions based on fee it offers to include in new block, here for demo we do that
console.log("Starting the miner....");
// The miner who mines, here is selected by us
arikkaCoin.minePendingTransactions("sarika-address");

console.log(`Balance of sarika is : ${arikkaCoin.getBalanceOfAddress("sarika-address")}`);
