import { LSD } from './lsd';
import { ConnectionConfiguration } from './types';

export const tab = async (connectionConfiguration: ConnectionConfiguration) => {
  const newLSD = new LSD(connectionConfiguration);
  const errorMessage = await newLSD.connect();

  if (errorMessage?.length ?? 0 > 0) {
    throw new Error(errorMessage);
  }

  return newLSD;
}
