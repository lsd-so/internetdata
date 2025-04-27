import { ConnectionConfiguration } from "./connection";
import { LSD } from "./lsd";

export const tab = async (connectionConfiguration: ConnectionConfiguration) => {
  const newLSD = new LSD(connectionConfiguration);
  await newLSD.connect();

  return newLSD;
};

export default {
  tab,
};
