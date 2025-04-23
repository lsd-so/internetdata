import { z } from 'zod';

import { Connection } from './connection';
import { Instruction, Operation, StringOp } from './types';

export class Trip {
  connection: Connection;

  // The different components that specify the page state we're on
  components: Array<Instruction>;

  // A map caching results from LSD executions
  queryCache: Record<string, Array<Record<string, any>>>;

  constructor(connection: Connection, initialComponents?: Array<Instruction>) {
    this.connection = connection;
    this.components = initialComponents || [];
    this.queryCache = {};
  }

  click(selector: String) {
    this.components.push({
      operation: Operation.CLICK,
      args: [selector],
    });
  }

  enter(selector: String, textToEnter: String) {
    this.components.push({
      operation: Operation.ENTER,
      args: [selector, textToEnter],
    });
  }

  imitate(skillIdentifier: String) {
    this.components.push({
      operation: Operation.ACCORDING,
      args: [skillIdentifier],
    });
  }

  async extrapolate<T extends z.ZodTypeAny>(schema: T): Promise<T> {
    const assembledQuery = this.components.map(component => [StringOp(component.operation), ...component.args].join(" ")).join(" |> ");

    const conn = await this.connection.establishConnection()
    const results = await conn.unsafe(assembledQuery);

    console.log("Got the following for results");
    console.log(results);

    return schema.parse(results) as z.infer<T>;
  }
}
