import { z } from "zod";

import { AliasArgument } from "./argument";
import { Connection } from "./connection";
import { Instruction, StringInstruction } from "./instruction";
import { Operation, OperationIsAssigning } from "./operation";
import { Target } from "./target";

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

    this.assembleQuery = this.assembleQuery.bind(this);
    this.associate = this.associate.bind(this);
    this.assign = this.assign.bind(this);
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

  assembleQuery(): string {
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

    return assembledQuery;
  }

  async execute(code: string): Promise<Array<Record<string, any>>> {
    const conn = await this.connection.establishConnection();
    const results = await conn.unsafe(code);
    return results;
  }

  async extrapolate<T extends z.ZodTypeAny>(schema: T): Promise<T> {
    const assembledQuery = this.assembleQuery();
    const conn = await this.connection.establishConnection();
    const results = await conn.unsafe(assembledQuery);

    return schema.parse(results) as z.infer<T>;
  }

  when(condition: String, thenFlow: String, elseFlow?: String): Trip {
    this.components.push({
      operation: Operation.WHEN,
      conditionalArgs: [condition],
      thenFlow: thenFlow ? [thenFlow] : [],
      elseFlow: elseFlow ? [elseFlow] : [],
    });

    return this;
  }

  assign(name: String, value: String): Trip {
    this.components.push({
      operation: Operation.ASSIGN,
      args: [`${name} <| ${value} |`],
    });

    return this;
  }

  associate(name: String, body?: (trip: Trip) => Trip): Trip {
    return this.define(name, [], body);
  }

  define(
    name: String,
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
    const bodyDefinition = outcome?.assembleQuery() ?? "";
    functionDefinition += bodyDefinition + " |";

    this.components.push({
      operation: Operation.ASSIGN,
      args: [functionDefinition],
    });
    return this;
  }
}
