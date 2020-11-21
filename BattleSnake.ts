export enum Move {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right",
  Forward = "forward",
}

interface RuleSet {
  name: string;
  version: string;
}

export interface Snake {
  id: string;
  name: string;
  latency: string;
  health: number;
  body: IPosition[];
  head: IPosition;
  length: number;
  shout: string;
}

export interface IPosition {
  x: number;
  y: number;
}

export class Position implements IPosition {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public get key(): string {
    return `${this.y}:${this.x}`;
  }

  public equals(pos: IPosition): boolean {
    return pos.x === this.x && pos.y === this.y;
  }

  public neighbours(
    board: Board,
  ): { dir: Move; pos: Position }[] {
    const neighbours = [];
    const snakes = board.snakes.map((s) => [s.head, ...s.body]).flat();

    if (this.x !== 0) {
      const p = new Position(this.x - 1, this.y);
      if (!snakes.find((s) => p.equals(s))) {
        neighbours.push({
          dir: Move.Left,
          pos: p,
        });
      }
    }

    if (this.x !== board.width - 1) {
      const p = new Position(this.x + 1, this.y);
      if (
        !snakes.find((s) => p.equals(s))
      ) {
        neighbours.push({
          dir: Move.Right,
          pos: p,
        });
      }
    }

    if (this.y !== 0) {
      const p = new Position(this.x, this.y - 1);
      if (
        !snakes.find((s) => p.equals(s))
      ) {
        neighbours.push({
          dir: Move.Down,
          pos: p,
        });
      }
    }

    if (this.y !== board.height - 1) {
      const p = new Position(this.x, this.y + 1);
      if (
        !snakes.find((s) => p.equals(s))
      ) {
        neighbours.push({
          dir: Move.Up,
          pos: p,
        });
      }
    }

    return neighbours;
  }
}

export interface Board {
  height: number;
  width: number;
  snakes: Snake[];
  food: IPosition[];
  hazards: IPosition[];
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

  // console.log({
  //   up: canMoveUp(snake, board),
  //   down: canMoveDown(snake, board),
  //   left: canMoveLeft(snake, board),
  //   right: canMoveRight(snake, board),
  // });

  return moves.filter((m) => !willDeadlock(snake, board, m));
}

// TODO: Remove, this is only for testing
function randomMove(moves: Move[]): Move {
  return moves[Math.floor(Math.random() * moves.length)];
}

export function getPreferredMovement(
  snake: Snake,
  board: Board,
  allowed: Move[],
): Move {
  const moveWeights = allowed.map((move) => {
    return {
      move: move,
      weight: getWeight(snake, board, move),
    };
  });

  const sorted = moveWeights.sort((a, b) => {
    if (a.weight > b.weight) {
      return -1;
    } else if (a.weight < b.weight) {
      return 1;
    } else {
      return 0;
    }
  });

  if (sorted[0].weight === 0) {
    return randomMove(allowed);
  }

  return sorted[0].move;
}

function getWeight(snake: Snake, board: Board, move: Move) {
  let weight = 0;
  // TODO: Shortest path to the food furthest from everyone
  const simulatedHeadPosition = simulatePosition(snake, move);
  const foodInPosition = board.food.find((p) =>
    p.x === simulatedHeadPosition.x && p.y === simulatedHeadPosition.y
  );

  const food = board.food[0];

  if (distanceTo(simulatedHeadPosition, food) < distanceTo(snake.head, food)) {
    weight += distanceTo(snake.head, food);
  }

  if (foodInPosition) {
    weight += 100;
  }

  return weight;
}

function simulatePosition(snake: Snake, move: Move): IPosition {
  switch (move) {
    case Move.Up:
      return new Position(snake.head.x, snake.head.y + 1);
    case Move.Down:
      return new Position(snake.head.x, snake.head.y - 1);
    case Move.Left:
      return new Position(snake.head.x - 1, snake.head.y);
    case Move.Right:
      return new Position(snake.head.x + 1, snake.head.y);
    default:
      return new Position(snake.head.x, snake.head.y);
  }
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

function distanceTo(pos1: IPosition, pos2: IPosition): number {
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

  const others = board.snakes.filter((s) => s.id !== snake.id);

  const otherHeadPositions = others.map((s) => [s.head]).reduce(
    (prev, curr) => {
      return [...prev, ...curr];
    },
    [],
  );

  for (const head of otherHeadPositions) {
    if (distanceTo(head, simulatedHeadPosition) <= 1) {
      //! If an opponents snake's head is one away from this pos as well, the position is contested
      return true;
    }
  }

  return false;
}

function willDeadlock(snake: Snake, board: Board, move: Move): boolean {
  const simulatedPosition = simulatePosition(snake, move);
  const movedSnake: Snake = JSON.parse(JSON.stringify(snake));
  movedSnake.head = simulatedPosition;
  movedSnake.body.pop();
  movedSnake.body.push(snake.head);

  const willDeadlock =
    !(canMoveUp(movedSnake, board) || canMoveDown(movedSnake, board) ||
      canMoveLeft(movedSnake, board) || canMoveRight(movedSnake, board));

  return willDeadlock;
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
  if (destinationIsContested(snake, board, Move.Up)) {
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
  if (destinationIsContested(snake, board, Move.Down)) {
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
  if (destinationIsContested(snake, board, Move.Left)) {
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
  if (destinationIsContested(snake, board, Move.Right)) {
    return false;
  }
  return true;
}
