import { GridPos } from '../types/restaurant';

interface PathNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

export class AStarPathfinder {
  private width: number;
  private height: number;
  private collisionGrid: boolean[][];

  constructor(width: number, height: number, collisionGrid: boolean[][]) {
    this.width = width;
    this.height = height;
    this.collisionGrid = collisionGrid;
  }

  public updateCollisionGrid(collisionGrid: boolean[][]): void {
    this.collisionGrid = collisionGrid;
  }

  public isWalkable(x: number, y: number): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
    return !this.collisionGrid[y]?.[x];
  }

  public findPath(start: GridPos, goal: GridPos, ignoreGoalObstacle = true): GridPos[] {
    if (start.x === goal.x && start.y === goal.y) return [start];

    // If goal is obstacle and we cannot ignore it, find nearest walkable neighbor
    if (!this.isWalkable(goal.x, goal.y) && !ignoreGoalObstacle) {
      const neighbor = this.getNearestWalkableNeighbor(goal, start);
      if (neighbor) {
        goal = neighbor;
      } else {
        return [];
      }
    }

    const openSet: PathNode[] = [];
    const closedSet = new Set<string>();

    const startNode: PathNode = {
      x: start.x,
      y: start.y,
      g: 0,
      h: this.heuristic(start, goal),
      f: this.heuristic(start, goal),
      parent: null,
    };

    openSet.push(startNode);

    while (openSet.length > 0) {
      // Find node with lowest f cost
      let lowestIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[lowestIndex].f) {
          lowestIndex = i;
        }
      }

      const current = openSet.splice(lowestIndex, 1)[0];
      const key = `${current.x},${current.y}`;

      if (current.x === goal.x && current.y === goal.y) {
        return this.reconstructPath(current);
      }

      closedSet.add(key);

      const neighbors = this.getNeighbors(current.x, current.y);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        if (closedSet.has(neighborKey)) continue;

        // Walkable check (or goal tile if ignoreGoalObstacle is true)
        const isGoalTile = neighbor.x === goal.x && neighbor.y === goal.y;
        if (!this.isWalkable(neighbor.x, neighbor.y) && !(isGoalTile && ignoreGoalObstacle)) {
          continue;
        }

        const tentativeG = current.g + 1;
        let neighborNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);

        if (!neighborNode) {
          neighborNode = {
            x: neighbor.x,
            y: neighbor.y,
            g: tentativeG,
            h: this.heuristic(neighbor, goal),
            f: tentativeG + this.heuristic(neighbor, goal),
            parent: current,
          };
          openSet.push(neighborNode);
        } else if (tentativeG < neighborNode.g) {
          neighborNode.g = tentativeG;
          neighborNode.f = tentativeG + neighborNode.h;
          neighborNode.parent = current;
        }
      }
    }

    return []; // No path found
  }

  private heuristic(a: GridPos, b: GridPos): number {
    // Manhattan distance with slight tie-breaker
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return (dx + dy) * 1.001;
  }

  private getNeighbors(x: number, y: number): GridPos[] {
    const dirs = [
      { x: 0, y: -1 }, // Up
      { x: 1, y: 0 },  // Right
      { x: 0, y: 1 },  // Down
      { x: -1, y: 0 }, // Left
    ];

    const results: GridPos[] = [];
    for (const dir of dirs) {
      const nx = x + dir.x;
      const ny = y + dir.y;
      if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
        results.push({ x: nx, y: ny });
      }
    }
    return results;
  }

  public getNearestWalkableNeighbor(target: GridPos, from: GridPos): GridPos | null {
    const neighbors = this.getNeighbors(target.x, target.y).filter(n => this.isWalkable(n.x, n.y));
    if (neighbors.length === 0) return null;

    // Sort by distance to 'from' position
    neighbors.sort((a, b) => this.heuristic(a, from) - this.heuristic(b, from));
    return neighbors[0];
  }

  private reconstructPath(endNode: PathNode): GridPos[] {
    const path: GridPos[] = [];
    let current: PathNode | null = endNode;
    while (current) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }
    return path;
  }
}
