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
  return o === Operation.TARGET;
};
