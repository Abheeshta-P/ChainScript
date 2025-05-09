import pkg from "elliptic";
const { ec: EC } = pkg;
import { Transaction, Block, Blockchain } from "./blockchain.js";

const ec = new EC("secp256k1");

const myKey = ec.keyFromPrivate(
  "52bafe98f17149a5804dffdb4b0aa9c0e50b22534453c9a7fa1d8cabf1d08335"
);
const myWalletAddress = myKey.getPublic("hex");

let arikkaCoin = new Blockchain(2, 100);

// Create a transaction and sign it, from the public key
const tx1 = new Transaction({ fromAddress: myWalletAddress, toAddress: myWalletAddress, amount: 10 });
tx1.signTransaction(myKey);
arikkaCoin.addTransaction(tx1);

console.log(`Balance of myWalletAddress is : ${arikkaCoin.getBalanceOfAddress(myWalletAddress)}`);

// Usually miners themself take up transactions based on fee it offers to include in new block, here for demo we do that
console.log("Starting the miner....");
// The miner who mines, here is selected by us
arikkaCoin.minePendingTransactions(myWalletAddress);

// Mine again to get the reward into the chain
console.log("Mining again to get the mining reward...");
arikkaCoin.minePendingTransactions(myWalletAddress);

console.log(`Balance of myWalletAddress is : ${arikkaCoin.getBalanceOfAddress(myWalletAddress)}`);

console.log("Is chain valid? before tampering : ", arikkaCoin.isChainValid());

// Tampering
arikkaCoin.chain[1].transactions[0].amount = 1;
console.log("Is chain valid? after tampering : ", arikkaCoin.isChainValid());

