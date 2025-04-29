export type BlockProps = {
  index: number;
  timestamp: string;
  data: string | object;
  previousHash?: string;
  hash?: string; 
  nonce?: number;
};

