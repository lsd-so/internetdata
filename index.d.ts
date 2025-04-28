declare module 'internetdata' {
  export interface ConnectionConfiguration {
    user: String;
    password: String;
  }

  export class Connection {
    host: String;
    connectionConfiguration: ConnectionConfiguration;
  }

  export class Trip {
    connection: Connection;
  }

  export class LSD {
    constructor(connectionConfiguration: ConnectionConfiguration)
    connect(): Promise<Trip>;
  }

  export function tab(connectionConfiguration: ConnectionConfiguration): LSD
}
