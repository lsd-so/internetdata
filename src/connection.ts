import postgres from 'postgres';

export interface ConnectionConfiguration {
  user: String;
  password: String;
}

// LSDConnection abstracts the postgres connection in case there's a need to retry connecting in the middle of a run
export class Connection {
  connectionConfiguration: ConnectionConfiguration;
  sqlConn?: postgres.Sql;

  constructor(connectionConfiguration: ConnectionConfiguration) {
    if (connectionConfiguration.user.length === 0) {
      throw new Error("Missing an LSD user, specify [user] in the configuration object");
    }

    if (connectionConfiguration.password.length === 0) {
      throw new Error("Missing an LSD password, specify [password] in the configuration object");
    }

    this.connectionConfiguration = connectionConfiguration;
    this.sqlConn = undefined;
  }

  async establishConnection(): Promise<postgres.Sql> {
    if (this.sqlConn !== undefined) {
      try {
        const results = await this.sqlConn.unsafe(`FROM https://lsd.so |> SELECT title`);
        console.log("Looking at the following for results");
        console.log(results);
        // Check to see still works then return
        // Otherwise set to undefined and then connect again
        return this.sqlConn;
      } catch (e) {
        this.sqlConn = undefined;
      }
    }

    this.sqlConn = postgres(`postgres://${this.connectionConfiguration.user}:${this.connectionConfiguration.password}@lsd.so:5432/${this.connectionConfiguration.user}`);
    return this.sqlConn;
  }
}
