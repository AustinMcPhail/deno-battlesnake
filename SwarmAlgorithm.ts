// deno-lint-ignore-file
import {
  Board,
  Game,
  IPosition,
  Move,
  Position,
  Snake,
} from "./BattleSnake.ts";

// function toMapKey(positon: IPosition): string {
//   return `${positon.y}:${positon.x}`;
// }

// enum NodeType {
//   Snake = "snake",
//   Food = "food",
//   Open = "open",
// }

// class Node {
//   id: string;
//   position: Position;
//   visited: boolean;
//   distance: number;
//   type: NodeType;
//   direction?: Move;
//   weight = 1;
//   previousNode?: IPosition;
//   path?: Move[];

//   constructor(
//     id: string,
//     position: Position,
//     visited?: boolean,
//     type?: NodeType,
//     distance?: number,
//     direction?: Move | undefined,
//     weight?: number,
//     previousNode?: IPosition,
//     path?: Move[],
//   ) {
//     this.id = id;
//     this.position = position;
//     this.visited = visited ?? false;
//     this.type = type ?? NodeType.Open;
//     this.distance = distance ?? -1;
//     this.direction = direction;
//     this.weight = weight ?? 1;
//     this.previousNode = previousNode ?? undefined;
//     this.path = path ?? undefined;
//   }
// }

// function closestNode(nodes: Map<string, Node>, unvisited: string[]): Node {
//   let currentClosest: Node | undefined;
//   let index: number = 0;
//   for (let i = 0; i < unvisited.length; i++) {
//     const node = nodes.get(unvisited[i]);
//     if (node && currentClosest) {
//       if (currentClosest.distance > node.distance) {
//         currentClosest = node;
//         index = i;
//       }
//     } else if (node && currentClosest === undefined) {
//       currentClosest = node;
//       index = i;
//     }
//   }
//   unvisited.splice(index, 1);

//   if (currentClosest === undefined) {
//     throw new Error("Could not find closest node");
//   }

//   return currentClosest;
// }

// export function notTheBees(snake: Snake, board: Board): Node | undefined {
//   const nodes = new Map<
//     string,
//     Node
//   >();
//   for (let y = 0; y <= board.height; y++) {
//     for (let x = 0; x <= board.width; x++) {
//       nodes.set(
//         toMapKey(new Position(x, y)),
//         new Node(
//           toMapKey(new Position(x, y)),
//           new Position(x, y),
//           false,
//           NodeType.Open,
//           distanceTo(snake.head, new Position(x, y)),
//         ),
//       );
//     }
//   }

//   // Set the Snake nodes
//   for (const s of board.snakes) {
//     nodes.set(
//       toMapKey(s.head),
//       new Node(
//         toMapKey(s.head),
//         s.head,
//         false,
//         NodeType.Snake,
//         distanceTo(snake.head, s.head),
//         relativeDirection(snake.head, s.head),
//       ),
//     );
//     for (const pos of s.body) {
//       nodes.set(
//         toMapKey(pos),
//         new Node(
//           toMapKey(pos),
//           pos,
//           false,
//           NodeType.Snake,
//           distanceTo(snake.head, pos),
//           relativeDirection(snake.head, pos),
//         ),
//       );
//     }
//   }

//   let closestFood: Position = board.food[0];
//   // Set the Food nodes
//   for (const food of board.food) {
//     if (distanceTo(snake.head, food) < distanceTo(snake.head, closestFood)) {
//       closestFood = food;
//     }
//     nodes.set(
//       toMapKey(food),
//       new Node(
//         toMapKey(food),
//         food,
//         false,
//         NodeType.Food,
//         distanceTo(snake.head, food),
//         relativeDirection(snake.head, food),
//       ),
//     );
//   }

//   nodes.set(
//     toMapKey(snake.head),
//     new Node(toMapKey(snake.head), snake.head, false, NodeType.Snake, 0),
//   );

//   const unvisited = Array.from(nodes.keys());

//   while (unvisited.length) {
//     // TODO: Get the closest node
//     let currentNode = closestNode(nodes, unvisited);
//     while (currentNode.type === NodeType.Snake && unvisited.length) {
//       currentNode = closestNode(nodes, unvisited);
//     }
//     if (currentNode.distance === Infinity) {
//       return;
//     }

//     //! Success
//     if (currentNode.id === toMapKey(closestFood)) return currentNode;

//     nodes.set(currentNode.id, {
//       ...currentNode,
//       visited: true,
//     });

//     // TODO: Update neighbours
//     updateNeighbors(
//       nodes,
//       currentNode,
//       board,
//       toMapKey(closestFood),
//       snake.head,
//       "poweredManhattanDistance",
//     );
//   }
// }

// function relativeDirection(origin: IPosition, target: IPosition): Move {
//   if (target.x < origin.x) {
//     return Move.Left;
//   }
//   if (target.x > origin.x) {
//     return Move.Right;
//   }
//   if (target.y < origin.y) {
//     return Move.Down;
//   }
//   if (target.y > origin.y) {
//     return Move.Up;
//   }
//   return Move.Forward;
// }

// function updateNeighbors(
//   nodes: Map<string, Node>,
//   currentNode: Node,
//   board: Board,
//   target: string,
//   start: Position,
//   heuristic: string,
// ): void {
//   console.log("getting neighbours");
//   const neighbors = getNeighbors(currentNode.id, nodes);
//   for (const n of neighbors) {
//     const targetNode = nodes.get(toMapKey(n));
//     const actualTarget = nodes.get(target);
//     const actualStart = nodes.get(toMapKey(start));
//     if (!targetNode || !actualTarget || !actualStart) {
//       throw new Error("Something went wrong while updating neighbors");
//     }
//     console.log("updating nodes");
//     updateNode(
//       currentNode,
//       targetNode,
//       actualTarget,
//       nodes,
//       actualStart,
//       heuristic,
//       board,
//     );
//   }
// }

// function updateNode(
//   currentNode: Node,
//   targetNode: Node,
//   actualTargetNode: Node,
//   nodes: Map<string, Node>,
//   actualStartNode: Node,
//   heuristic: string,
//   board: Board,
// ) {
//   const distance = getDistance(currentNode, targetNode);

//   let distanceToCompare;
//   const weight = targetNode?.weight === 15 ? 15 : 1;
//   if (heuristic === "manhattanDistance") {
//     distanceToCompare = currentNode.distance +
//       (distance[0] + weight) *
//         manhattanDistance(targetNode, actualTargetNode);
//   } else if (heuristic === "poweredManhattanDistance") {
//     distanceToCompare = currentNode.distance + targetNode.weight +
//       distance[0] +
//       Math.pow(manhattanDistance(targetNode, actualTargetNode), 2);
//   } else if (heuristic === "extraPoweredManhattanDistance") {
//     distanceToCompare = currentNode.distance +
//       (distance[0] + weight) *
//         Math.pow(manhattanDistance(targetNode, actualTargetNode), 7);
//   }

//   console.log("to compare", distanceToCompare);

//   if (!distanceToCompare) {
//     throw new Error("Could not get distance");
//   }

//   if (distanceToCompare < targetNode.distance) {
//     nodes.set(targetNode.id, {
//       ...targetNode,
//       previousNode: currentNode.position,
//       path: distance[1],
//       direction: distance[2],
//     });
//   }
// }

// function manhattanDistance(node1: Node, node2: Node) {
//   const xChange = Math.abs(node1.position.x - node2.position.x);
//   const yChange = Math.abs(node1.position.y - node2.position.y);
//   return (xChange + yChange);
// }

// function getDistance(node1: Node, node2: Node): [number, Move[], Move] {
//   if (node2.position.x < node1.position.x) {
//     if (node1.direction === Move.Up) {
//       return [1, [Move.Forward], Move.Up];
//     } else if (node1.direction === Move.Right) {
//       return [2, [Move.Left, Move.Forward], Move.Up];
//     } else if (node1.direction === Move.Left) {
//       return [2, [Move.Right, Move.Forward], Move.Up];
//     } else if (node1.direction === Move.Down) {
//       return [3, [Move.Right, Move.Right, Move.Forward], Move.Up];
//     }
//   } else if (node2.position.x > node1.position.x) {
//     if (node1.direction === Move.Up) {
//       return [3, [Move.Right, Move.Right, Move.Forward], Move.Down];
//     } else if (node1.direction === Move.Right) {
//       return [2, [Move.Right, Move.Forward], Move.Down];
//     } else if (node1.direction === Move.Left) {
//       return [2, [Move.Left, Move.Forward], Move.Down];
//     } else if (node1.direction === Move.Down) {
//       return [1, [Move.Forward], Move.Down];
//     }
//   }
//   if (node2.position.y < node1.position.y) {
//     if (node1.direction === Move.Up) {
//       return [2, [Move.Left, Move.Forward], Move.Left];
//     } else if (node1.direction === Move.Right) {
//       return [3, [Move.Left, Move.Left, Move.Forward], Move.Left];
//     } else if (node1.direction === Move.Left) {
//       return [1, [Move.Forward], Move.Left];
//     } else if (node1.direction === "down") {
//       return [2, [Move.Right, Move.Forward], Move.Left];
//     }
//   } else if (node2.position.y > node1.position.y) {
//     if (node1.direction === Move.Up) {
//       return [2, [Move.Right, Move.Forward], Move.Right];
//     } else if (node1.direction === Move.Right) {
//       return [1, [Move.Forward], Move.Right];
//     } else if (node1.direction === Move.Left) {
//       return [3, [Move.Right, Move.Right, Move.Forward], Move.Right];
//     } else if (node1.direction === "down") {
//       return [2, [Move.Left, Move.Forward], Move.Right];
//     }
//   }
//   throw new Error("Failed to get distance");
// }

// function getNeighbors(
//   id: string,
//   nodes: Map<string, Node>,
// ): Position[] {
//   const coordinates = id.split(":");
//   const x = parseInt(coordinates[1]);
//   const y = parseInt(coordinates[0]);

//   const neighbors: Position[] = [];
//   // Find Node in map
//   if (
//     nodes.has(toMapKey(new Position(x + 1, y))) &&
//     nodes.get(toMapKey(new Position(x + 1, y)))?.type !== NodeType.Snake
//   ) {
//     neighbors.push(new Position(x + 1, y));
//   }
//   if (
//     nodes.has(toMapKey(new Position(x - 1, y))) &&
//     nodes.get(toMapKey(new Position(x - 1, y)))?.type !== NodeType.Snake
//   ) {
//     neighbors.push(new Position(x - 1, y));
//   }
//   if (
//     nodes.has(toMapKey(new Position(x, y + 1))) &&
//     nodes.get(toMapKey(new Position(x, y + 1)))?.type !== NodeType.Snake
//   ) {
//     neighbors.push(new Position(x, y + 1));
//   }
//   if (
//     nodes.has(toMapKey(new Position(x, y - 1))) &&
//     nodes.get(toMapKey(new Position(x, y - 1)))?.type !== NodeType.Snake
//   ) {
//     neighbors.push(new Position(x, y - 1));
//   }

//   console.log("these neighbors", neighbors);

//   return neighbors;
// }

// function distanceTo(pos1: IPosition, pos2: IPosition): number {
//   const x2 = Math.pow((pos2.x - pos1.x), 2);
//   const y2 = Math.pow((pos2.x - pos1.x), 2);
//   return Math.sqrt(x2 + y2);
// }

// interface Particle {
//   type: NodeType;
//   visited: boolean;
//   distance: number;
//   position: Position;
//   // deno-lint-ignore no-explicit-any
//   pBest: any;
// }

// function PSO(game: Game, h: any): Move {
//   const MAX_ITERATIONS = game.board.width * game.board.height;
//   const FITNESS_FUNCTION = 3000000;

//   // Variables
//   let globalXBest = 0;
//   let globalYBest = 0;
//   const myPos = game.you.head;

//   // TODO: Select target food
//   const target: Position = { x: 5, y: 6 };

//   // Initialize Grid
//   const grid: Particle[][] = [];
//   for (let y = 0; y < game.board.height; y++) {
//     grid.push([]);
//     for (let x = 0; x <= game.board.width; x++) {
//       const particle = {
//         type: NodeType.Open,
//         visited: false,
//         distance: distanceTo(myPos, { x, y }),
//         position: { x, y },
//         pBest: undefined,
//       };
//       grid[y].push(particle);
//     }
//   }

//   // TODO: Add Snakes
//   for (const snake of game.board.snakes) {
//     grid[snake.head.y][snake.head.x].type = NodeType.Snake;
//     for (const body of snake.body) {
//       grid[body.y][body.x].type = NodeType.Snake;
//     }
//   }

//   // TODO: Add Food

//   let iteration = 0;
//   const done = false;
//   while (!done && iteration < MAX_ITERATIONS) {
//     for (const p of grid.flat()) {
//       // TODO: Calculate fitness

//       // If
//     }
//     iteration += 1;
//   }

//   return Move.Up;
// }
export function aStar(game: Game, h: any): Position {
  const start = new Position(game.you.head.x, game.you.head.y);
  const goal = game.board.food[0];

  const cameFrom: { [key: string]: Position } = {};

  const unvisited: Position[] = [];

  // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
  const gScore: { [key: string]: any } = {};

  // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
  // how short a path from start to finish can be if it goes through n.
  const fScore: { [key: string]: any } = {};

  for (let y = 0; y < game.board.height; y++) {
    for (let x = 0; x < game.board.width; x++) {
      const pos = new Position(x, y);
      gScore[pos.key] = Infinity;
      fScore[pos.key] = Infinity;
    }
  }

  unvisited.push(start);
  gScore[start.key] = 0;
  fScore[start.key] = h(start, start, game);

  while (unvisited.length) {
    console.log("gScore", gScore);
    console.log("fScore", fScore);

    // Get the node with lowest fScore and remove it from the unvisited list
    const current = unvisited.sort((a, b) =>
      fScore[a.key] - fScore[b.key]
    ).splice(0, 1)[0];

    if (current.equals(goal)) {
      // TODO: Reconstruct the path from current through cameFrom
      console.log("FOUND GOAL", current);
      return current;
    }

    console.log("current", current);
    console.log(
      "neighbors",
      current.neighbours(game.board),
    );
    // For each neighbour of the current
    for (
      const neighbour of current.neighbours(game.board)
    ) {
      const edgeWeight = getEdgeWeight(current, neighbour.pos);
      const tentative_gScore = gScore[current.key] + edgeWeight;
      if (tentative_gScore < gScore[neighbour.pos.key]) {
        cameFrom[neighbour.pos.key] = current;
        gScore[neighbour.pos.key] = tentative_gScore;
        fScore[neighbour.pos.key] = gScore[neighbour.pos.key] +
          h(start, neighbour, game);

        if (unvisited.findIndex((p) => p.key === neighbour.pos.key) !== -1) {
          unvisited.push(neighbour.pos);
        }
      }
    }
  }

  return new Position(0, 0);
}

function getEdgeWeight(pos1: Position, pos2: Position): number {
  return 1;
}
