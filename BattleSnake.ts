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

function simulatePosition(snake: Snake, move: Move): Position {
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
  return simulatedHeadPosition;
}

function willCollideWithSelf(snake: Snake, move: Move): boolean {
  const simulatedHeadPosition = simulatePosition(snake, move);

  const foundCollision = snake.body.find((p) => {
    return p.x === simulatedHeadPosition.x && p.y === simulatedHeadPosition.y;
  });

  if (foundCollision) {
    return true;
  }

  return false;
}

function willCollideWithOthers(
  snake: Snake,
  board: Board,
  move: Move,
): boolean {
  // TODO: Add a check for the probability that a snake will move to this position
  const simulatedHeadPosition = simulatePosition(snake, move);

  const others = board.snakes.filter((s) => s.id !== snake.id);

  const otherPositions = others.map((s) => [s.head, ...s.body]).reduce(
    (prev, curr) => {
      return [...prev, ...curr];
    },
    [],
  );

  const foundCollision = otherPositions.find((p) => {
    return p.x === simulatedHeadPosition.x && p.y === simulatedHeadPosition.y;
  });

  if (foundCollision) {
    return true;
  }

  return false;
}

function distanceTo(pos1: Position, pos2: Position): number {
  const x2 = Math.pow((pos2.x - pos1.x), 2);
  const y2 = Math.pow((pos2.x - pos1.x), 2);
  return Math.sqrt(x2 + y2);
}

function destinationIsContested(
  snake: Snake,
  board: Board,
  move: Move,
): boolean {
  // TODO: Add a check for the probability that a snake will move to this position
  const simulatedHeadPosition = simulatePosition(snake, move);
  const foodInPosition = board.food.find((p) =>
    p.x === simulatedHeadPosition.x && p.y === simulatedHeadPosition.y
  );

  if (!foodInPosition) {
    return false;
  }

  const others = board.snakes.filter((s) => s.id !== snake.id);

  const otherHeadPositions = others.map((s) => [s.head]).reduce(
    (prev, curr) => {
      return [...prev, ...curr];
    },
    [],
  );

  for (const head of otherHeadPositions) {
    console.log("distance", distanceTo(head, foodInPosition));
    if (distanceTo(head, foodInPosition) === 1) {
      //! If an opponents snake's head is one away as well, the food is contested
      return true;
    }
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
  if (willCollideWithOthers(snake, board, Move.Up)) {
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
  if (willCollideWithOthers(snake, board, Move.Down)) {
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
  if (willCollideWithOthers(snake, board, Move.Left)) {
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
  if (willCollideWithOthers(snake, board, Move.Right)) {
    return false;
  }
  return true;
}
