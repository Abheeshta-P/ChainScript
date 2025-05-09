export type BlockProps = {
  index?: number;
  timestamp: string;
  transactions: any;
  previousHash?: string;
  nonce?: number;
};

export type TransactionProps = {
  fromAddress: string;
  toAddress: string;
  amount: number;
};

