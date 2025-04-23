import { Connection, ConnectionConfiguration } from './connection';
import { Trip } from './trip';

export class LSD {
  connection: Connection;

  constructor(connectionConfiguration: ConnectionConfiguration) {
    this.connection = new Connection(connectionConfiguration);
  }

  async connect(): Promise<Trip> {
    const trip = new Trip();
    // Here is where we would attempt to connect to a postgres connection
  }
}
