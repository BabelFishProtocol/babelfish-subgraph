class BAsset {
  address: string;
  symbol: string;
  constructor(address: string, symbol: string) {
    this.address = address.toLowerCase();
    this.symbol = symbol;
  }
}

class RM {
  address: string;
  constructor(address: string) {
    this.address = address.toLowerCase();
  }
}

export const bassets: BAsset[] = [
  new BAsset('0xCb46C0DdC60d18eFEB0e586c17AF6Ea36452DaE0', 'DOC'),
  new BAsset('0x8C9abb6C9D8D15ddb7aDA2e50086E1050AB32688', 'bsBUSD'),
  new BAsset('0xC3De9f38581F83e281F260D0ddBAac0E102Ff9F8', 'rDOC'),
  new BAsset('0x10C5A7930fC417e728574E334b1488b7895c4B81', 'USDTes'),
  new BAsset('0xcc8Eec21ae75F1A2dE4aC7b32A7de888a45cF859', 'USDCes'),
  new BAsset('0x4D5a316D23eBE168d8f887b4447bf8DbFA4901CC', 'USDT'),
  new BAsset('0x007b3AA69A846Cb1f76B60B3088230A52D2A83aC', 'DLLR'),
  new BAsset('0x30199fc1322b89bbe8B575BA4f695632961fC8f3', 'SEPUSDes'),
  new BAsset('0x0188F7676Ec4956aDbEa415D38Ce7aF45D4721bd', 'MOC'),
  new BAsset('0x6b41566353d6C7B8C2a7931d498F11489DacAc29', 'ZUSD'),
];

export const rewardManagerAddress: RM = new RM('0xd7D4236adEa1fFE9C1C6b4A31Ac3d37AE146906D');
