import { supabase } from "@/lib/database/supabase";
import type { TransferPath } from "@/lib/database/supabase";

// =============================================================================
// PRIORITY QUEUE (for Dijkstra's algorithm)
// =============================================================================

// Binary min-heap implementation for O(log n) insertions
class PriorityQueue<T> {
  private heap: Array<{ element: T; priority: number }> = [];

  private parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private leftChild(i: number): number {
    return 2 * i + 1;
  }

  private rightChild(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = this.parent(index);
      if (this.heap[index].priority >= this.heap[parentIndex].priority) break;
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    while (true) {
      let smallest = index;
      const left = this.leftChild(index);
      const right = this.rightChild(index);

      if (left < this.heap.length && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < this.heap.length && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }
      if (smallest === index) break;

      this.swap(index, smallest);
      index = smallest;
    }
  }

  enqueue(element: T, priority: number): void {
    this.heap.push({ element, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop()?.element;

    const min = this.heap[0].element;
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return min;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
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
 * Calculate total miles received including bonuses
 * @param pointsTransferred - Amount of source points to transfer
 * @param ratio - Transfer ratio string (e.g., "3:1")
 * @param bonusThreshold - Points threshold for bonus (null if no bonus)
 * @param bonusAmount - Bonus miles per threshold (null if no bonus)
 * @param bonusApplies - Whether bonus applies
 * @returns Total destination miles received (base + bonus)
 */
export function calculateTransferWithBonus(
  pointsTransferred: number,
  ratio: string,
  bonusThreshold: number | null,
  bonusAmount: number | null,
  bonusApplies: boolean
): number {
  const { from: ratioFrom, to: ratioTo } = parseRatioToNumbers(ratio);
  
  // Base miles = (points_transferred / ratio_numerator) * ratio_denominator
  const baseMiles = Math.floor((pointsTransferred / ratioFrom) * ratioTo);
  
  // Bonus miles = floor(points_transferred / bonus_threshold) * bonus_amount
  let bonusMiles = 0;
  if (bonusApplies && bonusThreshold && bonusAmount && bonusThreshold > 0) {
    bonusMiles = Math.floor(pointsTransferred / bonusThreshold) * bonusAmount;
  }
  
  return baseMiles + bonusMiles;
}

/**
 * Parse ratio string to numbers (e.g., "3:1" → {from: 3, to: 1})
 */
function parseRatioToNumbers(ratio: string): { from: number; to: number } {
  const parts = ratio.split(":").map(Number);
  return { from: parts[0] || 1, to: parts[1] || 1 };
}

/**
 * Calculate optimal transfer amount to hit bonus thresholds
 * Returns the minimum amount to transfer that maximizes bonus efficiency
 * @param targetMiles - Desired destination miles
 * @param ratio - Transfer ratio string
 * @param bonusThreshold - Points threshold for bonus
 * @param bonusAmount - Bonus miles per threshold
 * @param bonusApplies - Whether bonus applies
 * @returns Optimal points to transfer
 */
export function calculateOptimalTransferAmount(
  targetMiles: number,
  ratio: string,
  bonusThreshold: number | null,
  bonusAmount: number | null,
  bonusApplies: boolean
): number {
  const { from: ratioFrom, to: ratioTo } = parseRatioToNumbers(ratio);
  
  // If no bonus, calculate directly
  if (!bonusApplies || !bonusThreshold || !bonusAmount || bonusThreshold <= 0) {
    return Math.ceil((targetMiles * ratioFrom) / ratioTo);
  }
  
  // Try different transfer amounts to find the most efficient
  // Start with base calculation
  let baseTransfer = Math.ceil((targetMiles * ratioFrom) / ratioTo);
  
  // Check if rounding up to next bonus threshold is more efficient
  const nextThreshold = Math.ceil(baseTransfer / bonusThreshold) * bonusThreshold;
  
  // Calculate miles received for base and threshold amounts
  const baseMiles = calculateTransferWithBonus(baseTransfer, ratio, bonusThreshold, bonusAmount, bonusApplies);
  const thresholdMiles = calculateTransferWithBonus(nextThreshold, ratio, bonusThreshold, bonusAmount, bonusApplies);
  
  // If threshold amount gives more miles for similar cost, use it
  if (thresholdMiles >= targetMiles && nextThreshold <= baseTransfer * 1.1) {
    return nextThreshold;
  }
  
  // Otherwise, find the minimum amount that gives us enough miles
  let optimalTransfer = baseTransfer;
  let currentMiles = calculateTransferWithBonus(optimalTransfer, ratio, bonusThreshold, bonusAmount, bonusApplies);
  
  // If we're close to a threshold, consider rounding up
  const distanceToThreshold = nextThreshold - baseTransfer;
  if (distanceToThreshold > 0 && distanceToThreshold <= bonusThreshold * 0.2) {
    // If rounding up to threshold gives us enough miles and is within 20% of threshold, do it
    if (thresholdMiles >= targetMiles) {
      return nextThreshold;
    }
  }
  
  // Otherwise, increment until we have enough miles
  while (currentMiles < targetMiles) {
    optimalTransfer += 100; // Increment by 100 points
    currentMiles = calculateTransferWithBonus(optimalTransfer, ratio, bonusThreshold, bonusAmount, bonusApplies);
    
    // Safety check to avoid infinite loops
    if (optimalTransfer > targetMiles * ratioFrom * 2) {
      break;
    }
  }
  
  return optimalTransfer;
}

/**
 * Calculate effective ratio including bonuses (for pathfinding)
 * Uses a sample transfer amount to estimate efficiency
 * @param ratio - Transfer ratio string
 * @param bonusThreshold - Points threshold for bonus
 * @param bonusAmount - Bonus miles per threshold
 * @param bonusApplies - Whether bonus applies
 * @param sampleAmount - Sample transfer amount to use for calculation (default 10000)
 * @returns Effective ratio (points lost per mile gained)
 */
function calculateEffectiveRatio(
  ratio: string,
  bonusThreshold: number | null,
  bonusAmount: number | null,
  bonusApplies: boolean,
  sampleAmount: number = 10000
): number {
  const { from: ratioFrom, to: ratioTo } = parseRatioToNumbers(ratio);
  
  // Base ratio
  const baseRatio = ratioFrom / ratioTo;
  
  // If no bonus, return base ratio
  if (!bonusApplies || !bonusThreshold || !bonusAmount || bonusThreshold <= 0) {
    return baseRatio;
  }
  
  // Calculate miles received with bonus
  const milesReceived = calculateTransferWithBonus(sampleAmount, ratio, bonusThreshold, bonusAmount, bonusApplies);
  
  // Effective ratio = points transferred / miles received
  if (milesReceived === 0) return baseRatio;
  return sampleAmount / milesReceived;
}

/**
 * Build adjacency list graph from transfer paths
 */
type GraphEdge = {
  to: number;
  ratio: number;
  transferTimeHours: number;
  ratioString: string; // Keep original ratio string for bonus calculations
  bonusThreshold: number | null;
  bonusAmount: number | null;
  bonusApplies: boolean;
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
      ratioString: path.ratio,
      bonusThreshold: path.bonus_threshold ?? null,
      bonusAmount: path.bonus_amount ?? null,
      bonusApplies: path.bonus_applies ?? false,
    });
  }

  return graph;
}

/**
 * Get edge weight based on optimization mode
 * For "value" mode, uses effective ratio including bonuses
 */
function getEdgeWeight(
  edge: GraphEdge,
  mode: "value" | "time" | "hops"
): number {
  switch (mode) {
    case "value":
      // Use effective ratio that accounts for bonuses
      // Use a sample amount to estimate efficiency
      return calculateEffectiveRatio(
        edge.ratioString,
        edge.bonusThreshold,
        edge.bonusAmount,
        edge.bonusApplies,
        10000 // Sample 10k points for estimation
      );
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
