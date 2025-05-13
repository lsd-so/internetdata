export enum Operation {
  ACCORDING = "ACCORDING",
  ASSIGN = "ASSIGN",
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
