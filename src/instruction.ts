import { AliasArgument } from "./argument";
import { Operation, StringOp } from "./operation";

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
      return `${StringOp(i.operation)} <| ${i.conditionalArgs?.join(" ") ?? "1 = 1"}${i.thenFlow ? " THEN " + i.thenFlow.join(" ") : ""}${i.elseFlow ? " ELSE " + i.elseFlow.join(" ") : ""}`;
    case Operation.WITH:
      if (i.args) {
        return `${StringOp(i.operation)} ${i.args[0]} ${i.args[1]}${i.args.length > 2 ? " " + i.args.slice(2).join(" ") : ""}`;
      } else {
        return ``;
      }
  }
};
