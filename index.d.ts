import { z } from "zod";
import { LSD } from "./src/lsd";

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
  }

  export function tab(connectionConfiguration?: ConnectionConfiguration): LSD;
}

interface ConnectionConfiguration {
  user: String;
  password: String;
}
declare const module: {
  tab(connectionConfiguration?: ConnectionConfiguration): LSD;
};
export default module;
