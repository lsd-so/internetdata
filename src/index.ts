import { ConnectionConfiguration } from "./connection";
import { LSD } from "./lsd";
import { Trip } from "./trip";

// Re-export types and classes
export { ConnectionConfiguration, LSD, Trip };
export type { Target } from "./types";

export const tab = (connectionConfiguration: ConnectionConfiguration): LSD => {
  return new LSD(connectionConfiguration);
};

class Sheet {
  static tab(connectionConfiguration: ConnectionConfiguration): LSD {
    return tab(connectionConfiguration);
  }
}

export default Sheet;
