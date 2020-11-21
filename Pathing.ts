import { Board, Game, IPosition, Move } from "./BattleSnake.ts";
import { PriorityQueue } from "./PriQueue.ts";

function findClosestGoal(pos: IPosition, goals: IPosition[]) {
  let shortest = Infinity;
  let index = 0;
  for (const [i, goal] of goals.entries()) {
    if (distanceTo(pos, goal) < shortest) {
      shortest = distanceTo(pos, goal);
      index = i;
    }
  }
  return goals.splice(index, 1)[0];
}

function destinationIsContested(
  destination: IPosition,
  game: Game,
): boolean {
  // TODO: Add a check for the probability that a snake will move to this position

  const others = game.board.snakes.filter((s) => s.id !== game.you.id);

  const otherHeadPositions = others.map((s) => s.head);

  for (const head of otherHeadPositions) {
    if (distanceTo(head, destination) <= 1) {
      //! If an opponents snake's head is one away from this pos as well, the position is contested
      console.log("AN ENEMY IS CLOSE TO THE DESTINATION");
      return true;
    }
  }

  return false;
}

export const findPath = (game: Game): IPosition[] => {
  const goals = game.board.food;
  const start = game.you.head;
  let end = findClosestGoal(start, goals);
  while (
    destinationIsContested(end, game) ||
    !getNeighbors(end, game, new PriorityQueue<IPosition>(), []).length
  ) {
    if (goals.length) {
      end = findClosestGoal(start, goals);
    } else {
      end = getSafeSpot(game);
    }
  }

  console.log("START", start);
  console.log("GOAL", end);
  const pq = new PriorityQueue<IPosition>();

  pq.in(start, Infinity);

  // Initialize
  const grid: number[][] = [];
  for (let y = 0; y < game.board.height; y++) {
    grid.push([]);
    for (let x = 0; x < game.board.width; x++) {
      grid[y].push(Infinity);
    }
  }

  for (let y = game.board.height - 1; y > 0; y--) {
    for (let x = 0; x < game.board.width; x++) {
      grid[y][x] = (distanceTo({ x, y }, end));
    }
  }

  const maxIterations = game.board.height * game.board.width;
  const path = [];
  let iteration = 0;
  while (!pq.isEmpty && iteration < maxIterations) {
    iteration++;
    const current = pq.out();
    // console.log("CURRENT", current);
    const neighbours = getNeighbors(current.item, game, pq, path);

    // if (!neighbours.length) {
    //   console.log("NO NEIGHBORS");
    //   if (current.item.x === end.x && current.item.y === end.y) {
    //     // ! The food is deadlocked. If I get it, i die. The goal needs to be recalculated
    //     if (goals.length) {
    //       if (path.length) {
    //         end = findClosestGoal(path[path.length - 1], goals);
    //       } else {
    //         end = findClosestGoal(start, goals);
    //       }
    //     } else {
    //       // There are no more options, choose a random safe spot on the board as the next end
    //       console.log("FINDING A SAFE PLACE");
    //       let safeSpot;
    //       while (safeSpot?.x != end.x && safeSpot?.y !== end.y) {
    //         safeSpot = getSafeSpot(game);
    //       }
    //       end = safeSpot;
    //     }
    //   } else {
    //     path.push(current.item);
    //   }
    // } else {
    //   path.push(current.item);
    // }
    path.push(current.item);
    if (current.item.x === end.x && current.item.y === end.y) {
      // ! Done
      break;
    }
    console.log(
      `neighbours of [${current.item.x}, ${current.item.y}]: `,
      neighbours,
    );
    for (const n of neighbours) {
      pq.in(n, distanceTo(n, end));
    }
    pq.print();
  }
  return path;
};

export function relativeMove(current: IPosition, destination: IPosition): Move {
  if (destination.x < current.x) {
    return Move.Left;
  }
  if (destination.x > current.x) {
    return Move.Right;
  }
  if (destination.y < current.y) {
    return Move.Down;
  }
  return Move.Up;
}

function getSafeSpot(game: Game): IPosition {
  let x = Math.floor(Math.random() * game.board.width);
  let y = Math.floor(Math.random() * game.board.height);
  while (isSnake({ x, y }, game.board)) {
    x = Math.floor(Math.random() * game.board.width);
    y = Math.floor(Math.random() * game.board.height);
  }
  return { x, y };
}

function getNeighbors(
  current: IPosition,
  game: Game,
  pq: PriorityQueue<IPosition>,
  path: IPosition[],
): IPosition[] {
  const n = [];
  const left: IPosition = { x: current.x - 1, y: current.y };
  const right: IPosition = { x: current.x + 1, y: current.y };
  const up: IPosition = { x: current.x, y: current.y - 1 };
  const down: IPosition = { x: current.x, y: current.y + 1 };

  const leftInPath = path.find((p) => p.x === left.x && p.y === left.y);
  const rightInPath = path.find((p) => p.x === right.x && p.y === right.y);
  const upInPath = path.find((p) => p.x === up.x && p.y === up.y);
  const downInPath = path.find((p) => p.x === down.x && p.y === down.y);

  if (
    !leftInPath && current.x !== 0 && !pq.contains(left) &&
    !isSnake(left, game.board)
  ) {
    n.push(left);
  }
  if (
    !rightInPath &&
    current.x !== game.board.width - 1 && !pq.contains(right) &&
    !isSnake(right, game.board)
  ) {
    n.push(right);
  }
  if (
    !upInPath && current.y !== 0 && !pq.contains(up) && !isSnake(up, game.board)
  ) {
    n.push(up);
  }
  if (
    !downInPath &&
    current.y !== game.board.height - 1 && !pq.contains(down) &&
    !isSnake(down, game.board)
  ) {
    n.push(down);
  }
  return n;
}

function isSnake(pos: IPosition, board: Board): boolean {
  const snakePositions = board.snakes.map((s) => [s.head, ...s.body]).flat();
  let found = false;
  for (const p of snakePositions) {
    if (p.x === pos.x && p.y == pos.y) {
      found = true;
      break;
    }
  }
  return found;
}

function distanceTo(pos1: IPosition, pos2: IPosition): number {
  const x2 = Math.pow((pos2.x - pos1.x), 2);
  const y2 = Math.pow((pos2.y - pos1.y), 2);
  return Math.sqrt(x2 + y2);
}
