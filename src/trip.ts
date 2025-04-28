import { z } from "zod";

import { Connection } from "./connection";
import {
  Instruction,
  Operation,
  OperationIsAssigning,
  StringInstruction,
  Target,
} from "./types";

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
    this.imitate = this.imitate.bind(this);
    this.group = this.group.bind(this);
    this.on = this.on.bind(this);
    this.select = this.select.bind(this);
    this.extrapolate = this.extrapolate.bind(this);
  }

  navigate(destination: String): Trip {
    this.components.push({
      operation: Operation.FROM,
      args: [destination],
    });

    return this;
  }

  click(selector: String): Trip {
    this.components.push({
      operation: Operation.CLICK,
      args: [selector],
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
}
