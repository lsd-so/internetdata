import { existsSync, readFileSync } from "fs";
import { join } from "path";
import os from "os";

import postgres from "postgres";
import { z } from "zod";

export interface AliasArgument {
  selecting: string;

  // alias is an optional field in case the user specifies a non-CSS selector label for the item they're interested in
  alias?: string;
}

export interface ConnectionConfiguration {
  user: string;
  password: string;
}

const getUserTouse = (
  connectionConfiguration?: ConnectionConfiguration,
): string => {
  const userFromConfigurationObject = connectionConfiguration?.user;
  if (userFromConfigurationObject) {
    return userFromConfigurationObject;
  }

  const userFromEnvVar = process.env.LSD_USER;
  if (userFromEnvVar) {
    return userFromEnvVar;
  }

  const lsdConfigExists = existsSync(join(os.homedir(), ".lsd"));
  if (lsdConfigExists) {
    const content = readFileSync(join(os.homedir(), ".lsd"), "utf-8");
    const asObject = z
      .object({
        user: z.string(),
        password: z.string(),
      })
      .parse(JSON.parse(content));
    if (asObject.user) {
      return asObject.user;
    }
  }

  return "";
};

const getPasswordToUse = (
  connectionConfiguration?: ConnectionConfiguration,
): string => {
  const passwordFromConfiguration = connectionConfiguration?.password;
  if (passwordFromConfiguration) {
    return passwordFromConfiguration;
  }

  const passwordFromEnvVar = process.env.LSD_PASSWORD;
  if (passwordFromEnvVar) {
    return passwordFromEnvVar;
  }

  const lsdConfigExists = existsSync(join(os.homedir(), ".lsd"));
  if (lsdConfigExists) {
    const content = readFileSync(join(os.homedir(), ".lsd"), "utf-8");
    const asObject = z
      .object({
        user: z.string(),
        password: z.string(),
      })
      .parse(JSON.parse(content));
    if (asObject.password) {
      return asObject.password;
    }
  }

  return "";
};

// LSDConnection abstracts the postgres connection in case there's a need to retry connecting in the middle of a run
export class Connection {
  host: string;
  connectionConfiguration: ConnectionConfiguration;
  sqlConn?: postgres.Sql;

  constructor(connectionConfiguration?: ConnectionConfiguration) {
    const userToUse = getUserTouse(connectionConfiguration);
    const passwordToUse = getPasswordToUse(connectionConfiguration);

    if (userToUse.length === 0) {
      throw new Error(
        "Missing an LSD user, specify [user] in the configuration object or set the [LSD_USER] environment variable",
      );
    }

    if (passwordToUse.length === 0) {
      throw new Error(
        "Missing an LSD password, specify [password] in the configuration object or set the [LSD_PASSWORD] environment variable",
      );
    }

    this.host = "lsd.so";
    this.connectionConfiguration = {
      user: userToUse,
      password: passwordToUse,
    };
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

export enum Operation {
  ACCORDING = "ACCORDING",
  ASSIGN = "ASSIGN",
  CLICK = "CLICK",
  DIVE = "DIVE",
  ENTER = "ENTER",
  FROM = "FROM",
  GROUP = "GROUP",
  RUN = "RUN",
  SELECT = "SELECT",
  TARGET = "TARGET",
  WHEN = "WHEN",
  WITH = "WITH",
}

export const StringOp = (o: Operation): String => {
  switch (o) {
    case Operation.ACCORDING:
      return "ACCORDING";
    case Operation.ASSIGN:
      return "ASSIGN";
    case Operation.CLICK:
      return "CLICK";
    case Operation.DIVE:
      return "DIVE";
    case Operation.ENTER:
      return "ENTER";
    case Operation.FROM:
      return "FROM";
    case Operation.GROUP:
      return "GROUP";
    case Operation.RUN:
      return "RUN";
    case Operation.SELECT:
      return "SELECT";
    case Operation.TARGET:
      return "TARGET";
    case Operation.WHEN:
      return "WHEN";
    case Operation.WITH:
      return "WITH";
  }
};

export const OperationIsAssigning = (o: Operation): Boolean => {
  return o === Operation.TARGET || o === Operation.ASSIGN;
};

export type Target = "BROWSER" | "TRAVERSER";

export interface Instruction {
  operation: Operation;
  args?: Array<string>;
  aliasedArgs?: Array<AliasArgument>;
  conditionalArgs?: Array<string>;
  thenFlow?: Array<string>;
  elseFlow?: Array<string>;
}

export const StringInstruction = (i: Instruction): String => {
  switch (i.operation) {
    case Operation.ACCORDING:
      return `${StringOp(i.operation)} TO ${i.args?.join(" ") ?? "yev/hn"}`;
    case Operation.ASSIGN:
      // Will have already been formatted
      if (i.args && i.args.length > 0) {
        return i.args[0];
      }
      return "";
    case Operation.CLICK:
      return `${StringOp(i.operation)} ON ${i.args?.join(" ") ?? "a"}`;
    case Operation.DIVE:
      return `${StringOp(i.operation)} INTO ${i.args?.join(" ") ?? "invalid"}`;
    case Operation.ENTER:
      return `${StringOp(i.operation)} INTO ${i.args?.join(" ") ?? 'input "text"'}`;
    case Operation.FROM:
      return `${StringOp(i.operation)} ${i.args?.join(" ") ?? "https://lsd.so"}`;
    case Operation.GROUP:
      return `${StringOp(i.operation)} BY ${i.args?.join(" ") ?? "div"}`;
    case Operation.RUN:
      return `${i.args?.join(" ") ?? ""}`;
    case Operation.SELECT:
      return `${StringOp(i.operation)} ${[...(i.args || []), ...(i.aliasedArgs || []).map((aliasedArg) => (aliasedArg.alias ? aliasedArg.selecting + " AS " + aliasedArg.alias : aliasedArg.selecting))].join(", ")}`;
    case Operation.TARGET:
      return `${StringOp(i.operation)} <| ${i.args?.join(" ") ?? "TRAVERSER"} |`;
    case Operation.WHEN:
      return `${StringOp(i.operation)} ${i.conditionalArgs?.join(" ") ?? "1 = 1"}${i.thenFlow ? " THEN " + i.thenFlow.join(" ") : ""}${i.elseFlow && i.elseFlow.length > 0 ? " ELSE " + i.elseFlow.join(" ") : ""}`;
    case Operation.WITH:
      if (i.args) {
        return `${StringOp(i.operation)} TIME ${i.args[0]} ${i.args[1]}${i.args.length > 2 ? " " + i.args.slice(2).join(" ") : ""}`;
      } else {
        return ``;
      }
  }
};

export class Trip {
  // The postgres connection abstraction for executing queries
  connection: Connection;

  // The different components that specify the page state we're on
  components: Array<Instruction>;

  // A map caching results from LSD executions
  queryCache: Record<string, Array<Record<string, any>>>;

  constructor(connection: Connection, initialComponents?: Array<Instruction>) {
    this.connection = connection;
    this.components = initialComponents || [];
    this.queryCache = {};

    this.after = this.after.bind(this);
    this.apply = this.apply.bind(this);
    this.around = this.around.bind(this);
    this.assembleQuery = this.assembleQuery.bind(this);
    this.associate = this.associate.bind(this);
    this.assign = this.assign.bind(this);
    this.before = this.before.bind(this);
    this.click = this.click.bind(this);
    this.define = this.define.bind(this);
    this.dive = this.dive.bind(this);
    this.enter = this.enter.bind(this);
    this.execute = this.execute.bind(this);
    this.extrapolate = this.extrapolate.bind(this);
    this.group = this.group.bind(this);
    this.imitate = this.imitate.bind(this);
    this.navigate = this.navigate.bind(this);
    this.on = this.on.bind(this);
    this.select = this.select.bind(this);
    this.when = this.when.bind(this);
  }

  after(timestamp: string | number, radius?: string): Trip {
    this.components.push({
      operation: Operation.WITH,
      args: ["AFTER", `${timestamp}`, ...(radius ? [radius] : [])],
    });

    return this;
  }

  around(timestamp: "ANYTIME" | string | number, radius?: string): Trip {
    this.components.push({
      operation: Operation.WITH,
      args: ["AROUND", `${timestamp}`, ...(radius ? [radius] : [])],
    });

    return this;
  }

  before(timestamp: string | number, radius?: string): Trip {
    this.components.push({
      operation: Operation.WITH,
      args: ["BEFORE", `${timestamp}`, ...(radius ? [radius] : [])],
    });

    return this;
  }

  apply(target: string, args?: Array<string>): Trip {
    this.components.push({
      operation: Operation.RUN,
      args: [target, ...(args || [])],
    });

    return this;
  }

  navigate(destination: string): Trip {
    this.components.push({
      operation: Operation.FROM,
      args: [destination],
    });

    return this;
  }

  click(selector: string, times?: number): Trip {
    if (times !== undefined) {
      let counter = 0;
      while (counter < times) {
        this.components.push({
          operation: Operation.CLICK,
          args: [selector],
        });
        counter += 1;
      }
    } else {
      this.components.push({
        operation: Operation.CLICK,
        args: [selector],
      });
    }

    return this;
  }

  dive(target: string): Trip {
    this.components.push({
      operation: Operation.DIVE,
      args: [target],
    });

    return this;
  }

  enter(selector: string, textToEnter: string): Trip {
    this.components.push({
      operation: Operation.ENTER,
      args: [selector, textToEnter],
    });

    return this;
  }

  imitate(skillIdentifier: string): Trip {
    this.components.push({
      operation: Operation.ACCORDING,
      args: [skillIdentifier],
    });

    return this;
  }

  on(target: Target): Trip {
    this.components.push({
      operation: Operation.TARGET,
      args: [target],
    });

    return this;
  }

  group(groupingBy: string): Trip {
    this.components.push({
      operation: Operation.GROUP,
      args: [groupingBy],
    });

    return this;
  }

  select(selecting: string | Record<string, string>, alias?: string): Trip {
    if (typeof selecting === "string") {
      this.components.push({
        operation: Operation.SELECT,
        aliasedArgs: [
          {
            selecting,
            alias,
          },
        ],
      });
    } else {
      this.components.push({
        operation: Operation.SELECT,
        aliasedArgs: Object.entries(selecting).map(([k, v]) => ({
          selecting: k,
          alias: v,
        })),
      });
    }

    return this;
  }

  assembleQuery(prefixWithPipeOperator?: boolean): string {
    let encounteredFirstNonAssigning = false;
    const assembledQuery = this.components.reduce((acc, cur) => {
      let possiblePrefix = "";
      if (prefixWithPipeOperator) {
        possiblePrefix = "|> ";
      } else if (acc.length > 0 && !OperationIsAssigning(cur.operation)) {
        if (encounteredFirstNonAssigning) {
          possiblePrefix = "|> ";
        } else {
          encounteredFirstNonAssigning = true;
          possiblePrefix = "\n";
        }
      }
      const codeToAppend = StringInstruction(cur).trim() + "\n";
      return acc + possiblePrefix + codeToAppend;
    }, "");

    return assembledQuery.trim();
  }

  async execute(code: string): Promise<Array<Record<string, any>>> {
    const conn = await this.connection.establishConnection();
    const results = await conn.unsafe(code);
    return results;
  }

  async extrapolate<T extends z.ZodTypeAny>(
    schema: T,
    showQuery?: boolean,
  ): Promise<T> {
    const assembledQuery = this.assembleQuery();
    if (showQuery) {
      console.log(`Code:\n${assembledQuery}`);
    }
    const conn = await this.connection.establishConnection();
    const results = await conn.unsafe(assembledQuery);

    return schema.parse(results) as z.infer<T>;
  }

  when(
    condition: string,
    thenFlow: (trip: Trip) => Trip,
    elseFlow?: (trip: Trip) => Trip,
  ): Trip {
    const thenTrip = new Trip(new Connection());
    const thenOutcome = thenFlow(thenTrip);
    const thenDefinition = thenOutcome?.assembleQuery(true) ?? "";

    const elseTrip = new Trip(new Connection());
    const elseOutcome = elseFlow?.(elseTrip) ?? undefined;
    const elseDefinition = elseOutcome?.assembleQuery(true) ?? "";

    this.components.push({
      operation: Operation.WHEN,
      conditionalArgs: [condition],
      thenFlow: thenDefinition ? [thenDefinition] : [],
      elseFlow: elseDefinition ? [elseDefinition] : [],
    });

    return this;
  }

  assign(name: string, value: string): Trip {
    this.components.push({
      operation: Operation.ASSIGN,
      args: [`${name} <| ${value} |`],
    });

    return this;
  }

  associate(name: string, body?: (trip: Trip) => Trip): Trip {
    return this.define(name, [], body);
  }

  define(
    name: string,
    args?: Array<AliasArgument>,
    body?: (trip: Trip) => Trip,
  ): Trip {
    let functionDefinition = `${name} <|> `;
    if (args && args.length > 0) {
      // If there are function args provided
      functionDefinition += args.join(" ") + " <| ";
    }
    functionDefinition += "\n";

    const tripForDefinition = new Trip(new Connection());
    const outcome = body?.(tripForDefinition);
    const bodyDefinition = outcome?.assembleQuery(true) ?? "";
    functionDefinition += bodyDefinition.trim() + " |";

    this.components.push({
      operation: Operation.ASSIGN,
      args: [functionDefinition],
    });
    return this;
  }
}

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
