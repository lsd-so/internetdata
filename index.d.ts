import { z } from "zod";

export class Connection {
  host: String;
  connectionConfiguration: ConnectionConfiguration;
}

declare module "internetdata" {
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

    navigate: (destination: String) => Trip;
    click: (selector: String) => Trip;
    enter: (selector: String, textToEnter: String) => Trip;
    imitate: (skillIdentifier: String) => Trip;
    group: (groupingBy: String) => Trip;
    on: (target: String) => Trip;
    select: (selecting: String, alias?: String) => Trip;
    extrapolate: <T extends z.ZodTypeAny>(schema: T) => Promise<T>;
    execute: (code: string) => Promise<Array<Record<string, any>>>;
  }

  export function tab(
    connectionConfiguration?: ConnectionConfiguration,
  ): Promise<Trip>;
}

interface ConnectionConfiguration {
  user: String;
  password: String;
}
export class Trip {
  connection: Connection;

  navigate: (destination: String) => Trip;
  click: (selector: String) => Trip;
  enter: (selector: String, textToEnter: String) => Trip;
  imitate: (skillIdentifier: String) => Trip;
  group: (groupingBy: String) => Trip;
  on: (target: String) => Trip;
  select: (selecting: String, alias?: String) => Trip;
  extrapolate: <T extends z.ZodTypeAny>(schema: T) => Promise<T>;
  execute: (code: string) => Promise<Array<Record<string, any>>>;
}
declare const module: {
  tab(connectionConfiguration?: ConnectionConfiguration): Promise<Trip>;
};
export default module;
