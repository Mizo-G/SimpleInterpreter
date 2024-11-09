import * as readline from "readline";
import { stdin as input, stdout as output } from "process";

const rl = readline.createInterface({ input, output });

type TOKEN_TYPE = "EOF" | "INTEGER" | "PLUS" | "MINUS" | "MULTIPLY" | "DIVIDE";

type Token = {
  val: string | number;
  type: TOKEN_TYPE;
};

// lhs: left hand side.
// rhs: right hand side.
// op: operation.
type Expr = {
  lhs: number;
  rhs: number;
  op: TOKEN_TYPE;
}

let text: string = "";
let pos: number = 0;
let currentToken: Token;

const isDigit = (c: string): boolean => c.trim() !== "" && isFinite(Number(c));

function getNextToken(): Token {
  // skip whitespace
  while (pos < text.length && !text[pos].trim()) {
    pos++;
  }

  // return end of file token
  if (pos > text.length - 1) return { val: "", type: "EOF" };

  // get current char and increment pos.
  let currentChar = text[pos++];

  // check if char is an operation.
  if (currentChar === "+") return { val: "+", type: "PLUS" };
  if (currentChar === "-") return { val: "-", type: "MINUS" };
  if (currentChar === "*") return { val: "*", type: "MULTIPLY" };
  if (currentChar === "/") return { val: "/", type: "DIVIDE" };

  // check if it's number.
  if (isDigit(currentChar)) {
    // if number has more than one digit - e.g. 23 - :
    // place the first digit numStr, so numStr will be 2.
    let numStr = currentChar;
    
    // check if there are more digits, e.g. 23: 
    // add them to numStr if they are digits.
    while (pos < text.length && isDigit(text[pos])) {
      numStr += text[pos++];
    }
    
    // return the full number.
    return { val: Number(numStr), type: "INTEGER" };
  }

  // if token is not eof, operation or integer: then throw.
  throw `cannot parse input ${currentChar}`;
}

function eat(type: TOKEN_TYPE) {
  // check if the currentToken type matches the expected type.
  if (currentToken.type !== type)
    throw `cannot parse input: ${currentToken.val} of type: ${currentToken.type} into: ${type}`;
  currentToken = getNextToken();
}

function eatOperation(types: TOKEN_TYPE[]) {
  // check if the currentToken type matches any 
  // type from an array of expected types.
  // the some() will break as soon as one 
  // element matches the condition.
  // if none match, some() returns false.
  const match = types.some(t => currentToken.type === t);
  if (!match)
    throw `cannot parse input: ${currentToken.val} of type: ${currentToken.type} into a valid operation`;
  currentToken = getNextToken();
}

function evalExpr(expr: Expr) {
  const { lhs, rhs, op } = expr;
  let result = 0;
  switch (op) {
    case "PLUS":
      result = lhs + rhs;
      break;
    case "MINUS":
      result = lhs - rhs;
      break;
    case "MULTIPLY":
      result = lhs * rhs;
      break;
    case "DIVIDE":
      result = lhs / rhs;
      break;
    default: throw(`unsupported operation: ${op}`);
  }
  return result;
}

function expr(): number {
  currentToken = getNextToken();

  let left = currentToken.val as number;
  eat("INTEGER");

  let op = currentToken.type;
  eatOperation(["PLUS", "MINUS", "MULTIPLY", "DIVIDE"]);

  let right = currentToken.val as number;
  eat("INTEGER");

  // assign the answer of the first expr to left
  // and use left as the lhs for the next expr.
  left =  evalExpr({lhs: left,  rhs: right, op: op});
  
  // if there are more expressions: 
  // get the new operation and the new rhs,
  // then eval the expr with previous answer
  // as the lhs (this ignores order of operation).
  while (currentToken.type !== "EOF") {
    op = currentToken.type;
    eatOperation(["PLUS", "MINUS", "MULTIPLY", "DIVIDE"]);

    right = currentToken.val as number;
    eat("INTEGER");
  
    // use left as the new lhs for the next expr.
    left =  evalExpr({lhs: left,  rhs: right, op: op});
  }
  return left
}

function receiveInput() {
  rl.question("calc> ", (answer: string) => {
    text = answer.trim();
    // reset the pos
    pos = 0;
    
    if (text.toLowerCase() === "q") {
      console.log(`exiting...`);
      rl.close();
      return;
    }
    
    if (!text) {
      console.log(`input is empty. input q to exit.`);
      // ask for new input.
      receiveInput();
      return;
    }

    try {
      const ans = expr();
      console.log(ans);
    }
    catch (error) {
      console.error(error);
    }
    
    // use recursion to loop until 'q' is inputted.
    receiveInput();
  });
}

// start the process 
receiveInput();