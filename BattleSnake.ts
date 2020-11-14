export enum Move {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right",
}

interface RuleSet {
  name: string;
  version: string;
}

interface Snake {
  id: string;
  name: string;
  latency: string;
  health: number;
  body: Position[];
  head: Position;
  length: number;
  shout: string;
}

interface Position {
  x: number;
  y: number;
}

interface Board {
  height: number;
  width: number;
  snakes: Snake[];
  food: Position[];
  hazards: Position[];
}

export interface Game {
  game: {
    id: string;
    ruleset: RuleSet;
    timeout: number;
  };
  turn: number;
  board: Board;
  you: Snake;
}

export function getSafeMovements(snake: Snake, board: Board): Move[] {
  const moves = [];
  if (canMoveUp(snake, board)) moves.push(Move.Up);
  if (canMoveDown(snake, board)) moves.push(Move.Down);
  if (canMoveLeft(snake, board)) moves.push(Move.Left);
  if (canMoveRight(snake, board)) moves.push(Move.Right);

  console.log({
    up: canMoveUp(snake, board),
    down: canMoveDown(snake, board),
    left: canMoveLeft(snake, board),
    right: canMoveRight(snake, board),
  });

  return moves;
}

function willCollideWithSelf(snake: Snake, move: Move): boolean {
  let simulatedHeadPosition: Position;

  switch (move) {
    case Move.Up:
      simulatedHeadPosition = { x: snake.head.x, y: snake.head.y + 1 };
      break;
    case Move.Down:
      simulatedHeadPosition = { x: snake.head.x, y: snake.head.y - 1 };
      break;
    case Move.Left:
      simulatedHeadPosition = { x: snake.head.x - 1, y: snake.head.y };
      break;
    case Move.Right:
      simulatedHeadPosition = { x: snake.head.x + 1, y: snake.head.y };
      break;
  }

  const foundCollision = snake.body.find((p) => {
    return p.x === simulatedHeadPosition.x && p.y === simulatedHeadPosition.y;
  });

  console.log("move", move);
  console.log("head", snake.head);
  console.log("simulated", simulatedHeadPosition);
  console.log("body", snake.body);
  if (foundCollision) {
    console.log("will collide");
  } else {
    console.log("won't collide");
  }
  console.log("\n");

  if (foundCollision) {
    return true;
  }

  return false;
}

function canMoveUp(snake: Snake, board: Board): boolean {
  if (snake.head.y === board.height - 1) {
    return false;
  }
  if (willCollideWithSelf(snake, Move.Up)) {
    return false;
  }
  return true;
}

function canMoveDown(snake: Snake, board: Board): boolean {
  if (snake.head.y === 0) {
    return false;
  }
  if (willCollideWithSelf(snake, Move.Down)) {
    return false;
  }
  return true;
}

function canMoveLeft(snake: Snake, board: Board): boolean {
  if (snake.head.x === 0) {
    return false;
  }
  if (willCollideWithSelf(snake, Move.Left)) {
    return false;
  }
  return true;
}

function canMoveRight(snake: Snake, board: Board): boolean {
  if (snake.head.x === board.width - 1) {
    return false;
  }
  if (willCollideWithSelf(snake, Move.Right)) {
    return false;
  }
  return true;
}
