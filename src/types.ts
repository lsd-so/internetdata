export enum Operation {
  ACCORDING = 'ACCORDING',
  CLICK = 'CLICK',
  ENTER = 'ENTER',
}

export const StringOp = (o: Operation): String => {
  switch (o) {
    case Operation.ACCORDING:
      return 'ACCORDING'
    case Operation.CLICK:
      return 'CLICK'
    case Operation.ENTER:
      return 'ENTER'
  }
}

export interface Instruction {
  operation: Operation;
  args: Array<String>;
}
