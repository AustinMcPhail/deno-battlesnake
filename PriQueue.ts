export interface Node<T> {
  item: T;
  // deno-lint-ignore no-explicit-any
  priority: number | ((...args: any) => number);
}

export class PriorityQueue<T> {
  private list: Node<T>[] = [];

  constructor() {
  }

  get size(): number {
    return this.list.length;
  }

  get isEmpty(): boolean {
    return this.size === 0;
  }

  // deno-lint-ignore no-explicit-any
  public in(item: T, p: number | ((...args: any) => number)) {
    let priority = Infinity;
    if (typeof p === "number") {
      priority = p as number;
    } else {
      // deno-lint-ignore no-explicit-any
      const priMethod = p as ((...args: any) => number);
      priority = priMethod();
    }

    if (this.isEmpty || priority > this.list[this.list.length - 1].priority) {
      this.list.push({ item, priority });
      return;
    }

    for (const [index, node] of this.list.entries()) {
      if (priority < this.list[index].priority) {
        this.list.splice(index, 0, { item, priority });
        break;
      }
    }
  }

  public out(): Node<T> {
    const node = this.list.shift();
    if (node === undefined) {
      throw new Error("Could not shift.");
    }

    return node;
  }

  public contains(item: T): boolean {
    if (this.isEmpty) {
      return false;
    }
    let found = false;
    for (const node of this.list) {
      if (JSON.stringify(node.item) === JSON.stringify(item)) {
        found = true;
        break;
      }
    }
    return found;
  }

  public print(): void {
    for (const node of this.list) {
      console.log(node);
    }
  }
}
