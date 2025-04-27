import postgres from "postgres";

export interface ConnectionConfiguration {
  user: String;
  password: String;
}

// LSDConnection abstracts the postgres connection in case there's a need to retry connecting in the middle of a run
export class Connection {
  host: String;
  connectionConfiguration: ConnectionConfiguration;
  sqlConn?: postgres.Sql;

  constructor(connectionConfiguration: ConnectionConfiguration) {
    if (connectionConfiguration.user.length === 0) {
      throw new Error(
        "Missing an LSD user, specify [user] in the configuration object",
      );
    }

    if (connectionConfiguration.password.length === 0) {
      throw new Error(
        "Missing an LSD password, specify [password] in the configuration object",
      );
    }

    this.host = "lsd.so";
    this.connectionConfiguration = connectionConfiguration;
    this.sqlConn = undefined;
  }

  async establishConnection(): Promise<postgres.Sql> {
    if (this.sqlConn !== undefined) {
      try {
        await this.sqlConn.unsafe(`FROM https://lsd.so |> SELECT title`);

        return this.sqlConn;
      } catch (e) {
        this.sqlConn = undefined;
      }
    }

    const connectionURI = `postgres://${this.connectionConfiguration.user}:${this.connectionConfiguration.password}@${this.host}:5432/${this.connectionConfiguration.user}`;
    this.sqlConn = postgres(connectionURI);
    return this.sqlConn;
  }
}
