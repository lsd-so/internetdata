import { z } from 'zod';

import { Instruction, Operation, StringOp } from './types';

export class Trip {
  // The different components that specify the page state we're on
  components: Array<Instruction>;

  // A map caching results from LSD executions
  queryCache: Record<string, Array<Record<string, any>>>;

  constructor(initialComponents?: Array<Instruction>) {
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
    })
  }

  async extrapolate<T extends z.ZodTypeAny>(): Promise<T> {
    const assembledQuery = this.components.map(component => [StringOp(component.operation), ...component.args].join(" ")).join(" |> ")


    // Here is where we would derive the nested object[s] from T
    // With type set limitations on how far nested objects can be (for now until we can juggle different objects)
    // and then 
  }
}
