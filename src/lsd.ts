import { ConnectionConfiguration } from './types';

// LSDConnection abstracts the postgres connection in case there's a need to retry connecting in the middle of a run
export class Connection {
  connectionConfiguration: ConnectionConfiguration

  constructor(connectionConfiguration: ConnectionConfiguration) {
    if (connectionConfiguration.user.length === 0) {
      throw new Error("Missing an LSD user, specify [user] in the configuration object");
    }

    if (connectionConfiguration.password.length === 0) {
      throw new Error("Missing an LSD password, specify [password] in the configuration object");
    }

    this.connectionConfiguration = connectionConfiguration;
  }
}

export class LSD {
  connection: Connection;

  constructor(connectionConfiguration: ConnectionConfiguration) {
    this.connection = new Connection(connectionConfiguration);
  }

  async connect(): Promise<string | undefined> {
    // Here is where we would attempt to connect to a postgres connection
  }
}
