import { createAndReturnBAsset, removeBAsset } from '../entities/BAsset';
import {
  BassetAdded,
  BassetRemoved,
} from '../../generated/BasketManagerV3/BasketManagerV3';

export function handleBassetAdded(event: BassetAdded): void {
  createAndReturnBAsset(event.params.basset, event);
}

export function handleBassetRemoved(event: BassetRemoved): void {
  removeBAsset(event.params.basset);
}
