import { existsSync, readFileSync } from "fs";
import { join } from "path";
import os from "os";

import postgres from "postgres";
import { z } from "zod";

export interface ConnectionConfiguration {
  user: String;
  password: String;
}

const getUserTouse = (
  connectionConfiguration?: ConnectionConfiguration,
): String => {
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
): String => {
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
  host: String;
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

export type Target = "BROWSER" | "TRAVERSER";

export enum Operation {
  ACCORDING = "ACCORDING",
  CLICK = "CLICK",
  DIVE = "DIVE",
  ENTER = "ENTER",
  FROM = "FROM",
  GROUP = "GROUP",
  SELECT = "SELECT",
  TARGET = "TARGET",
  WHEN = "WHEN",
}

export const StringOp = (o: Operation): String => {
  switch (o) {
    case Operation.ACCORDING:
      return "ACCORDING";
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
    case Operation.SELECT:
      return "SELECT";
    case Operation.TARGET:
      return "TARGET";
    case Operation.WHEN:
      return "WHEN";
  }
};

export const OperationIsAssigning = (o: Operation): Boolean => {
  return o === Operation.TARGET;
};

interface AliasArgument {
  selecting: String;

  // alias is an optional field in case the user specifies a non-CSS selector label for the item they're interested in
  alias?: String;
}

export interface Instruction {
  operation: Operation;
  args?: Array<String>;
  aliasedArgs?: Array<AliasArgument>;
  conditionalArgs?: Array<String>;
  thenFlow?: Array<String>;
  elseFlow?: Array<String>;
}

export const StringInstruction = (i: Instruction): String => {
  switch (i.operation) {
    case Operation.ACCORDING:
      return `${StringOp(i.operation)} TO ${i.args?.join(" ") ?? "yev/hn"}`;
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
    case Operation.SELECT:
      return `${StringOp(i.operation)} ${[...(i.args || []), ...(i.aliasedArgs || []).map((aliasedArg) => (aliasedArg.alias ? aliasedArg.selecting + " AS " + aliasedArg.alias : aliasedArg.selecting))].join(", ")}`;
    case Operation.TARGET:
      return `${StringOp(i.operation)} <| ${i.args?.join(" ") ?? "TRAVERSER"} |`;
    case Operation.WHEN:
      return `${StringOp(i.operation)} <| ${i.conditionalArgs?.join(" ") ?? "1 = 1"}${i.thenFlow ? " THEN " + i.thenFlow.join(" ") : ""}${i.elseFlow ? " ELSE " + i.elseFlow.join(" ") : ""}`;
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

    this.navigate = this.navigate.bind(this);
    this.click = this.click.bind(this);
    this.enter = this.enter.bind(this);
    this.dive = this.dive.bind(this);
    this.imitate = this.imitate.bind(this);
    this.group = this.group.bind(this);
    this.on = this.on.bind(this);
    this.select = this.select.bind(this);
    this.execute = this.execute.bind(this);
    this.extrapolate = this.extrapolate.bind(this);
    this.when = this.when.bind(this);
  }

  navigate(destination: String): Trip {
    this.components.push({
      operation: Operation.FROM,
      args: [destination],
    });

    return this;
  }

  click(selector: String, times?: number): Trip {
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

  dive(target: String): Trip {
    this.components.push({
      operation: Operation.DIVE,
      args: [target],
    });

    return this;
  }

  enter(selector: String, textToEnter: String): Trip {
    this.components.push({
      operation: Operation.ENTER,
      args: [selector, textToEnter],
    });

    return this;
  }

  imitate(skillIdentifier: String): Trip {
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

  group(groupingBy: String): Trip {
    this.components.push({
      operation: Operation.GROUP,
      args: [groupingBy],
    });

    return this;
  }

  select(selecting: String, alias?: String): Trip {
    this.components.push({
      operation: Operation.SELECT,
      aliasedArgs: [
        {
          selecting,
          alias,
        },
      ],
    });

    return this;
  }

  async execute(code: string): Promise<Array<Record<string, any>>> {
    const conn = await this.connection.establishConnection();
    const results = await conn.unsafe(code);
    return results;
  }

  async extrapolate<T extends z.ZodTypeAny>(schema: T): Promise<T> {
    const assigningComponents = this.components.filter((component) =>
      OperationIsAssigning(component.operation),
    );
    const generalComponents = this.components.filter(
      (component) => !OperationIsAssigning(component.operation),
    );

    const assembledQuery =
      assigningComponents.map((component) => StringInstruction(component)) +
      "\n" +
      generalComponents
        .map((component) => StringInstruction(component))
        .join(" |> ");

    const conn = await this.connection.establishConnection();
    const results = await conn.unsafe(assembledQuery);

    return schema.parse(results) as z.infer<T>;
  }

  when(condition: String, thenFlow: String, elseFlow?: String) {
    this.components.push({
      operation: Operation.WHEN,
      conditionalArgs: [condition],
      thenFlow: thenFlow ? [thenFlow] : [],
      elseFlow: elseFlow ? [elseFlow] : [],
    });
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
