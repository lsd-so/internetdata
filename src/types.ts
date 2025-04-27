export enum Operation {
  ACCORDING = "ACCORDING",
  CLICK = "CLICK",
  ENTER = "ENTER",
  FROM = "FROM",
  GROUP = "GROUP",
  SELECT = "SELECT",
  TARGET = "TARGET",
}

export const StringOp = (o: Operation): String => {
  switch (o) {
    case Operation.ACCORDING:
      return "ACCORDING";
    case Operation.CLICK:
      return "CLICK";
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
}

export const StringInstruction = (i: Instruction): String => {
  switch (i.operation) {
    case Operation.ACCORDING:
      return `${StringOp(i.operation)} TO ${i.args?.join(" ") ?? "yev/hn"}`;
    case Operation.CLICK:
      return `${StringOp(i.operation)} ON ${i.args?.join(" ") ?? "a"}`;
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
  }
};
