import { Connection, ConnectionConfiguration } from "@connection";
import { Trip } from "@trip";

export class LSD {
  connection: Connection;

  constructor(connectionConfiguration?: ConnectionConfiguration) {
    this.connection = new Connection(connectionConfiguration);
  }

  async connect(): Promise<Trip> {
    const trip = new Trip(this.connection);
    return trip;
  }
}

export const tab = (
  connectionConfiguration?: ConnectionConfiguration,
): Promise<Trip> => {
  const lsd = new LSD(connectionConfiguration);
  return lsd.connect();
};

export default {
  tab,
};
