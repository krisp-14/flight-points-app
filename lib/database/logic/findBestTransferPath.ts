import { supabase } from "@/lib/database/supabase";
import type { TransferPath } from "@/lib/database/supabase";

// =============================================================================
// PRIORITY QUEUE (for Dijkstra's algorithm)
// =============================================================================

class PriorityQueue<T> {
  private items: Array<{ element: T; priority: number }> = [];

  enqueue(element: T, priority: number) {
    const queueElement = { element, priority };
    let added = false;

    for (let i = 0; i < this.items.length; i++) {
      if (queueElement.priority < this.items[i].priority) {
        this.items.splice(i, 0, queueElement);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(queueElement);
    }
  }

  dequeue(): T | undefined {
    return this.items.shift()?.element;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Parse transfer ratio string (e.g., "2:1" → 2.0, "1:1" → 1.0)
 * Returns the cost multiplier (how many source points per destination point)
 */
function parseRatio(ratio: string): number {
  const [from, to] = ratio.split(":").map(Number);
  if (!from || !to) return 1; // Fallback to 1:1 if invalid
  return from / to;
}

/**
 * Build adjacency list graph from transfer paths
 */
type GraphEdge = {
  to: number;
  ratio: number;
  transferTimeHours: number;
};

type Graph = Map<number, GraphEdge[]>;

function buildGraph(transferPaths: TransferPath[]): Graph {
  const graph: Graph = new Map();

  for (const path of transferPaths) {
    if (!graph.has(path.from_program_id)) {
      graph.set(path.from_program_id, []);
    }

    graph.get(path.from_program_id)!.push({
      to: path.to_program_id,
      ratio: parseRatio(path.ratio),
      transferTimeHours: path.transfer_time_hours,
    });
  }

  return graph;
}

/**
 * Get edge weight based on optimization mode
 */
function getEdgeWeight(
  edge: GraphEdge,
  mode: "value" | "time" | "hops"
): number {
  switch (mode) {
    case "value":
      return edge.ratio; // Minimize points lost
    case "time":
      return edge.transferTimeHours; // Minimize transfer time
    case "hops":
      return 1; // Not used in BFS, but for consistency
  }
}

/**
 * Reconstruct path from previous map
 */
function reconstructPath(
  previous: Map<number, number>,
  target: number,
  source: number
): number[] {
  const path: number[] = [];
  let current = target;

  while (current !== source) {
    path.unshift(current);
    const prev = previous.get(current);
    if (prev === undefined) break;
    current = prev;
  }

  path.unshift(source);
  return path;
}

// =============================================================================
// PATHFINDING ALGORITHMS
// =============================================================================

/**
 * Dijkstra's algorithm for finding shortest path
 * Used for 'value' and 'time' optimization modes
 */
function dijkstra(
  graph: Graph,
  source: number,
  targets: number[],
  mode: "value" | "time"
): { path: number[]; cost: number } | null {
  const distances = new Map<number, number>();
  const previous = new Map<number, number>();
  const pq = new PriorityQueue<number>();
  const visited = new Set<number>();

  // Initialize
  distances.set(source, 0);
  pq.enqueue(source, 0);

  while (!pq.isEmpty()) {
    const current = pq.dequeue();
    if (current === undefined) break;

    // Skip if already visited
    if (visited.has(current)) continue;
    visited.add(current);

    // Check if we reached a target
    if (targets.includes(current)) {
      return {
        path: reconstructPath(previous, current, source),
        cost: distances.get(current) || 0,
      };
    }

    // Explore neighbors
    const neighbors = graph.get(current) || [];
    for (const edge of neighbors) {
      if (visited.has(edge.to)) continue;

      const weight = getEdgeWeight(edge, mode);
      const currentDistance = distances.get(current) || 0;
      const newDistance = currentDistance + weight;
      const existingDistance = distances.get(edge.to);

      if (existingDistance === undefined || newDistance < existingDistance) {
        distances.set(edge.to, newDistance);
        previous.set(edge.to, current);
        pq.enqueue(edge.to, newDistance);
      }
    }
  }

  return null; // No path found
}

/**
 * BFS (Breadth-First Search) for finding path with fewest hops
 * Used for 'hops' optimization mode
 */
function bfs(
  graph: Graph,
  source: number,
  targets: number[]
): { path: number[]; cost: number } | null {
  const queue: number[] = [source];
  const visited = new Set<number>([source]);
  const previous = new Map<number, number>();

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Check if we reached a target
    if (targets.includes(current)) {
      const path = reconstructPath(previous, current, source);
      return {
        path,
        cost: path.length - 1, // Number of hops
      };
    }

    // Explore neighbors
    const neighbors = graph.get(current) || [];
    for (const edge of neighbors) {
      if (!visited.has(edge.to)) {
        visited.add(edge.to);
        previous.set(edge.to, current);
        queue.push(edge.to);
      }
    }
  }

  return null; // No path found
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

export type TransferPathResult = {
  path: number[]; // Array of program IDs in order
  totalCost: number; // Total cost (points ratio, hours, or hops depending on mode)
  totalTime: number; // Total transfer time in hours
  warnings: string[];
};

export async function findBestTransferPath({
  sourceProgramId,
  destinationProgramIds,
  mode,
}: {
  sourceProgramId: number;
  destinationProgramIds: number[];
  mode: "value" | "time" | "hops";
}): Promise<TransferPathResult | null> {
  // Edge case: source is already a destination
  if (destinationProgramIds.includes(sourceProgramId)) {
    return {
      path: [sourceProgramId],
      totalCost: 0,
      totalTime: 0,
      warnings: [],
    };
  }

  // Fetch all transfer paths from database
  const { data: edges, error } = await supabase
    .from("transfer_paths")
    .select("*");

  if (error || !edges) {
    console.error("Error fetching transfer paths:", error);
    return null;
  }

  // Build graph
  const graph = buildGraph(edges);

  // Run appropriate algorithm based on mode
  let result: { path: number[]; cost: number } | null = null;

  if (mode === "hops") {
    result = bfs(graph, sourceProgramId, destinationProgramIds);
  } else {
    result = dijkstra(graph, sourceProgramId, destinationProgramIds, mode);
  }

  if (!result) {
    return null; // No path found
  }

  // Calculate total transfer time
  let totalTime = 0;
  const warnings: string[] = [];

  for (let i = 0; i < result.path.length - 1; i++) {
    const from = result.path[i];
    const to = result.path[i + 1];

    // Find the edge
    const edge = graph.get(from)?.find((e) => e.to === to);
    if (edge) {
      totalTime += edge.transferTimeHours;

      // Add warnings for slow transfers
      if (edge.transferTimeHours > 72) {
        warnings.push(
          `Transfer from program ${from} to ${to} takes ${edge.transferTimeHours} hours (${Math.ceil(edge.transferTimeHours / 24)} days)`
        );
      }
    }
  }

  return {
    path: result.path,
    totalCost: result.cost,
    totalTime,
    warnings,
  };
}
