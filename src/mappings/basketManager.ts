import { createAndReturnBAsset, removeBAsset } from '../entities/BAsset';
import {
  BassetAdded,
  BassetRemoved,
  AddBassetCall,
  AddBassetsCall,
} from '../../generated/BasketManagerV3/BasketManagerV3';

export function handleBassetAdded(event: BassetAdded): void {
  createAndReturnBAsset(event.params.basset);
}

export function handleBassetRemoved(event: BassetRemoved): void {
  removeBAsset(event.params.basset);
}

export function handleAddBasset(call: AddBassetCall): void {
  createAndReturnBAsset(call.inputs._basset);
}

export function handleAddBassets(call: AddBassetsCall): void {
  let length = call.inputs._bassets.length;

  for (let i = 0; i < length; i++) {
    let asset = call.inputs._bassets[i];
    createAndReturnBAsset(asset);
  }
}
