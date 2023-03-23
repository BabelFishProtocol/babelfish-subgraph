class BAsset {
  address: string;
  symbol: string;
  constructor(address: string, symbol: string) {
    this.address = address.toLowerCase();
    this.symbol = symbol;
  }
}

export const bassets: BAsset[] = [
  new BAsset('0x2aCc95758f8b5F583470bA265Eb685a8f45fC9D5', 'RIF'),
  new BAsset('0x6D9659BDF5b1a1Da217f7BBAf7DBaf8190e2e71b', 'BNBs'),
  new BAsset('0xE700691Da7B9851F2F35f8b8182C69C53ccad9DB', 'DOC'),
  new BAsset('0xE700691Da7B9851F2F35f8b8182C69C53ccad9DB', 'DOC'),
  new BAsset('0xE700691Da7B9851F2F35f8b8182C69C53ccad9DB', 'DOC'),
  new BAsset('0xE700691Da7B9851F2F35f8b8182C69C53ccad9DB', 'DOC'),
  new BAsset('0xE700691Da7B9851F2F35f8b8182C69C53ccad9DB', 'DOC'),
  new BAsset('0xE700691Da7B9851F2F35f8b8182C69C53ccad9DB', 'DOC'),
  new BAsset('0xE700691Da7B9851F2F35f8b8182C69C53ccad9DB', 'DOC'),
  new BAsset('0xE700691Da7B9851F2F35f8b8182C69C53ccad9DB', 'DOC'),
  new BAsset('0xE700691Da7B9851F2F35f8b8182C69C53ccad9DB', 'DOC'),
  new BAsset('0xE700691Da7B9851F2F35f8b8182C69C53ccad9DB', 'DOC'),
  new BAsset('0xE700691Da7B9851F2F35f8b8182C69C53ccad9DB', 'DOC'),
];
