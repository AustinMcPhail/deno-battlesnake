import {
  Application,
  Context,
  Request,
  Router,
} from "https://deno.land/x/oak/mod.ts";
import { findPath, Game, relativeMove } from "./Pathing.ts";
const env = Deno.env.toObject();

const enum Head {
  Beluga = "beluga",
  Bendr = "bendr",
  Dead = "dead",
  Default = "default",
  Evil = "evil",
  Fang = "fang",
  Pixel = "pixel",
  SandWorm = "sand-worm",
  Safe = "safe",
  Shades = "shades",
  Silly = "silly",
  Smile = "smile",
  Tongue = "tongue",
}

const enum Tail {
  BlockBum = "block-bum",
  Bolt = "bolt",
  Curled = "curled",
  Default = "default",
  FatRattle = "fat-rattle",
  Freckled = "freckled",
  Hook = "hook",
  Pixel = "pixel",
  RoundBum = "round-bum",
  Sharp = "sharp",
  Skinny = "skinny",
  SmallRattle = "small-rattle",
}

class Snake {
  private apiversion = "1";
  private author: string;
  private color: string;
  private head: Head;
  private tail: Tail;
  constructor(author: string, color: string, head?: Head, tail?: Tail) {
    this.author = author;
    this.color = color;
    this.head = head ?? Head.Default;
    this.tail = tail ?? Tail.Default;
  }
}

const LengthyLarry = new Snake(
  "AustinMcPhail",
  "#34ebc3",
  Head.Bendr,
  Tail.Pixel,
);

// deno-lint-ignore no-explicit-any
async function getBody(req: Request): Promise<any> {
  const result = req.body({
    contentTypes: {
      text: ["application/javascript"],
    },
  });

  return await result.value;
}

const handleIndex = async (ctx: Context) => {
  const { request: req, response: res } = ctx;

  console.log("INDEXING");

  res.status = 200;
  res.body = LengthyLarry;
};

const handleStart = async (ctx: Context) => {
  const { request: req, response: res } = ctx;
  const game = await getBody(req);

  console.log("STARTING", game.board);

  res.status = 200;
};

const handleMove = async (ctx: Context) => {
  const { request: req, response: res } = ctx;
  const game: Game = await getBody(req);

  console.log("Turn: ", game.turn);
  try {
    const path = findPath(game);
    console.log("PATH", path);
    if (path.length) {
      const destination = path[1];
      if (destination) {
        const move = relativeMove(game.you.head, destination);
        console.log("relative move", move);
        res.status = 200;
        res.body = {
          move: move,
          shout: move ? "" : "Shiiiiiiiiiiiii-",
        };
      } else {
        res.status = 200;
        res.body = {
          move: "up",
          shout: "Shiiiiiiiiiiiii-",
        };
      }
    }
  } catch (e) {
    console.error(e);
  }
};

const handleEnd = async (ctx: Context) => {
  const { request: req, response: res } = ctx;
  const body = await getBody(req);

  console.log("ENDING");

  res.status = 200;
};

const router = new Router();
router.get("/", handleIndex);
router.post("/start", handleStart);
router.post("/move", handleMove);
router.post("/end", handleEnd);

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: +env.PORT || 3000 });
