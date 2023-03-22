import { Address, ethereum } from '@graphprotocol/graph-ts';
import { BAsset } from '../../generated/schema';
import { ERC20 as ERC20TokenContract } from '../../generated/BasketManagerV3/ERC20';

export function createAndReturnBAsset(
  tokenAddress: Address,
  event: ethereum.Event
): BAsset {
  let token = BAsset.load(tokenAddress.toHex());
  if (token === null) {
    token = new BAsset(tokenAddress.toHex());
    const tokenContract = ERC20TokenContract.bind(tokenAddress);
    const assetNameResult = tokenContract.try_name();
    if (!assetNameResult.reverted) {
      token.name = assetNameResult.value;
    }
    const tokenSymbolResult = tokenContract.try_symbol();
    if (!tokenSymbolResult.reverted) {
      token.symbol = tokenSymbolResult.value;
    }
    const assetDecimalResult = tokenContract.try_decimals();
    if (!assetDecimalResult.reverted) {
      token.decimals = assetDecimalResult.value;
    }
    token.paused = false;
    token.balance = BigDecimal.zero();
    token.createdAtTx = event.transaction.id.toHexString();

    Boolean!;
    BigDecimal!;
    Int!;
    Global!;
    token.save();
  }
  return token;
}
