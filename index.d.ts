import { z } from "zod";

/**
 * The module in which this SDK is defined
 * @module internetdata
 */
declare module "internetdata" {
  /**
   * Configuration for establishing a connection to the LSD service.
   * @property {String} user - The username for authentication. Can be provided via LSD_USER environment variable or .lsd config file.
   * @property {String} password - The password for authentication. Can be provided via LSD_PASSWORD environment variable or .lsd config file.
   */
  export interface ConnectionConfiguration {
    user: String;
    password: String;
  }

  /**
   * Manages the connection to the LSD service.
   * Handles authentication and maintains the database connection.
   * @property {String} host - The hostname of the LSD service.
   * @property {ConnectionConfiguration} connectionConfiguration - The configuration used for authentication.
   */
  export class Connection {
    host: String;
    connectionConfiguration: ConnectionConfiguration;
  }

  /**
   * Represents a browsing session or "trip" through web content.
   * Provides methods for navigation, interaction, and data extraction.
   * @property {Connection} connection - The connection to the LSD service.
   */
  export class Trip {
    connection: Connection;

    navigate: (destination: String) => Trip;
    click: (selector: String, times?: number) => Trip;
    dive: (target: String) => Trip;
    enter: (selector: String, textToEnter: String) => Trip;
    imitate: (skillIdentifier: String) => Trip;
    group: (groupingBy: String) => Trip;
    on: (target: String) => Trip;
    select: (selecting: String, alias?: String) => Trip;
    extrapolate: <T extends z.ZodTypeAny>(schema: T) => Promise<T>;
    when: (condition: String, thenFlow: String, elseFlow?: String) => Trip;
  }

  const defaultExport: {
    tab: (connectionConfiguration?: ConnectionConfiguration) => Promise<Trip>;
  };

  export = defaultExport;
}
