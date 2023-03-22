import { onPause, onUnpause } from '../../generated/PauseManager/PauseManager';
import { togglePauseBAsset } from '../entities/BAsset';

export function handleOnPause(event: onPause): void {
  togglePauseBAsset(event.params.token, true);
}

export function handleOnUnpause(event: onUnpause): void {
  togglePauseBAsset(event.params.token, false);
}
