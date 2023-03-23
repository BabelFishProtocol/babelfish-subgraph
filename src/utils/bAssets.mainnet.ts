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
  new BAsset('0x2d919f19D4892381d58EdEbEcA66D5642ceF1A1F', 'RDOC'),
  new BAsset('0xEf213441a85DF4d7acBdAe0Cf78004E1e486BB96', 'rUSDT'),
  new BAsset('0x61e9604e31a736129d7f5C58964c75935b2d80D6', 'BUSDbs'),
  new BAsset('0x6A42Ff12215a90f50866A5cE43A9c9C870116e76', 'DAIbs'),
  new BAsset('0x91EDceE9567cd5612c9DEDeaAE24D5e574820af1', 'USDCbs'),
  new BAsset('0xFf4299bCA0313C20A61dc5eD597739743BEf3f6d', 'USDTbs'),
  new BAsset('0x1A37c482465e78E6DAbE1Ec77B9a24D4236D2A11', 'DAIes'),
  new BAsset('0x8D1f7CbC6391D95E2774380e80A666FEbf655D6b', 'USDCes'),
  new BAsset('0xD9665EA8F5fF70Cf97E1b1Cd1B4Cd0317b0976e8', 'USDTes'),
];
