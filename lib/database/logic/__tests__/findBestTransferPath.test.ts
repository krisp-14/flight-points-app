/**
 * Unit tests for pathfinding algorithms
 *
 * To run these tests, install Jest or Vitest:
 * npm install --save-dev jest @types/jest ts-jest
 *
 * Then add to package.json scripts:
 * "test": "jest"
 *
 * Or use Vitest:
 * npm install --save-dev vitest
 * "test": "vitest"
 */

import { findBestTransferPath } from "../findBestTransferPath";
import type { TransferPath } from "@/lib/database/supabase";

// Mock Supabase client
jest.mock("@/lib/database/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from "@/lib/database/supabase";

// Sample transfer paths for testing
// Graph structure:
// 1 (Amex) -> 2 (Aeroplan): 1:1, 24h
// 1 (Amex) -> 3 (RBC): 2:1, 48h
// 2 (Aeroplan) -> 4 (Air Canada): 1:1, 12h
// 3 (RBC) -> 4 (Air Canada): 1:1.5, 72h
// 3 (RBC) -> 5 (WestJet): 1:1, 24h
// 4 (Air Canada) -> 5 (WestJet): 3:1, 96h

const mockTransferPaths: TransferPath[] = [
  {
    id: 1,
    from_program_id: 1,
    to_program_id: 2,
    ratio: "1:1",
    transfer_time_hours: 24,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: 2,
    from_program_id: 1,
    to_program_id: 3,
    ratio: "2:1",
    transfer_time_hours: 48,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: 3,
    from_program_id: 2,
    to_program_id: 4,
    ratio: "1:1",
    transfer_time_hours: 12,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: 4,
    from_program_id: 3,
    to_program_id: 4,
    ratio: "1:1.5",
    transfer_time_hours: 72,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: 5,
    from_program_id: 3,
    to_program_id: 5,
    ratio: "1:1",
    transfer_time_hours: 24,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: 6,
    from_program_id: 4,
    to_program_id: 5,
    ratio: "3:1",
    transfer_time_hours: 96,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
];

describe("findBestTransferPath", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock Supabase response
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: mockTransferPaths,
        error: null,
      }),
    });
  });

  describe("Edge Cases", () => {
    test("should return direct path when source is already in destinations", async () => {
      const result = await findBestTransferPath({
        sourceProgramId: 1,
        destinationProgramIds: [1, 2, 3],
        mode: "value",
      });

      expect(result).not.toBeNull();
      expect(result?.path).toEqual([1]);
      expect(result?.totalCost).toBe(0);
      expect(result?.totalTime).toBe(0);
      expect(result?.warnings).toEqual([]);
    });

    test("should return null when no path exists", async () => {
      const result = await findBestTransferPath({
        sourceProgramId: 1,
        destinationProgramIds: [999], // Non-existent program
        mode: "value",
      });

      expect(result).toBeNull();
    });

    test("should handle database errors gracefully", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: new Error("Database error"),
        }),
      });

      const result = await findBestTransferPath({
        sourceProgramId: 1,
        destinationProgramIds: [4],
        mode: "value",
      });

      expect(result).toBeNull();
    });
  });

  describe("Value Optimization Mode", () => {
    test("should find direct transfer (1 hop)", async () => {
      const result = await findBestTransferPath({
        sourceProgramId: 1,
        destinationProgramIds: [2],
        mode: "value",
      });

      expect(result).not.toBeNull();
      expect(result?.path).toEqual([1, 2]);
      expect(result?.totalCost).toBe(1); // 1:1 ratio
      expect(result?.totalTime).toBe(24);
    });

    test("should find best value path for multi-hop transfer", async () => {
      // From 1 to 4:
      // Path A: 1 -> 2 -> 4 (cost: 1 + 1 = 2)
      // Path B: 1 -> 3 -> 4 (cost: 2 + 0.67 = 2.67)
      // Should choose Path A (better value)
      const result = await findBestTransferPath({
        sourceProgramId: 1,
        destinationProgramIds: [4],
        mode: "value",
      });

      expect(result).not.toBeNull();
      expect(result?.path).toEqual([1, 2, 4]);
      expect(result?.totalCost).toBe(2);
      expect(result?.totalTime).toBe(36); // 24 + 12
    });

    test("should prefer lower ratio (better value)", async () => {
      // From 1 to 5:
      // Path A: 1 -> 3 -> 5 (cost: 2 + 1 = 3)
      // Path B: 1 -> 2 -> 4 -> 5 (cost: 1 + 1 + 3 = 5)
      // Should choose Path A
      const result = await findBestTransferPath({
        sourceProgramId: 1,
        destinationProgramIds: [5],
        mode: "value",
      });

      expect(result).not.toBeNull();
      expect(result?.path).toEqual([1, 3, 5]);
      expect(result?.totalCost).toBe(3);
    });

    test("should find path to any of multiple destinations", async () => {
      // Should find path to closest destination (program 2)
      const result = await findBestTransferPath({
        sourceProgramId: 1,
        destinationProgramIds: [2, 4, 5],
        mode: "value",
      });

      expect(result).not.toBeNull();
      expect(result?.path).toEqual([1, 2]); // Shortest path
    });
  });

  describe("Time Optimization Mode", () => {
    test("should find fastest transfer path", async () => {
      // From 1 to 4:
      // Path A: 1 -> 2 -> 4 (time: 24 + 12 = 36h)
      // Path B: 1 -> 3 -> 4 (time: 48 + 72 = 120h)
      // Should choose Path A (faster)
      const result = await findBestTransferPath({
        sourceProgramId: 1,
        destinationProgramIds: [4],
        mode: "time",
      });

      expect(result).not.toBeNull();
      expect(result?.path).toEqual([1, 2, 4]);
      expect(result?.totalTime).toBe(36);
    });

    test("should warn about slow transfers (>72 hours)", async () => {
      // Path 1 -> 3 -> 4 has a 72h transfer
      const result = await findBestTransferPath({
        sourceProgramId: 3,
        destinationProgramIds: [4],
        mode: "time",
      });

      expect(result).not.toBeNull();
      expect(result?.warnings.length).toBeGreaterThan(0);
      expect(result?.warnings[0]).toContain("72 hours");
    });
  });

  describe("Hops Optimization Mode (BFS)", () => {
    test("should find path with fewest transfers", async () => {
      // From 1 to 5:
      // Path A: 1 -> 3 -> 5 (2 hops)
      // Path B: 1 -> 2 -> 4 -> 5 (3 hops)
      // Should choose Path A (fewest hops)
      const result = await findBestTransferPath({
        sourceProgramId: 1,
        destinationProgramIds: [5],
        mode: "hops",
      });

      expect(result).not.toBeNull();
      expect(result?.path).toEqual([1, 3, 5]);
      expect(result?.totalCost).toBe(2); // Number of hops
    });

    test("should find direct path when available (0 additional hops)", async () => {
      const result = await findBestTransferPath({
        sourceProgramId: 1,
        destinationProgramIds: [2, 3],
        mode: "hops",
      });

      expect(result).not.toBeNull();
      expect(result?.path.length).toBe(2); // Source + 1 destination
      expect(result?.totalCost).toBe(1); // 1 hop
    });
  });

  describe("Complex Scenarios", () => {
    test("should handle multiple valid targets and pick optimal", async () => {
      const result = await findBestTransferPath({
        sourceProgramId: 1,
        destinationProgramIds: [2, 3, 4, 5],
        mode: "value",
      });

      expect(result).not.toBeNull();
      // Should find program 2 (direct, best value)
      expect(result?.path).toEqual([1, 2]);
      expect(result?.totalCost).toBe(1);
    });

    test("should calculate total time correctly for multi-hop path", async () => {
      const result = await findBestTransferPath({
        sourceProgramId: 1,
        destinationProgramIds: [4],
        mode: "time",
      });

      expect(result).not.toBeNull();
      expect(result?.totalTime).toBe(36); // 24 + 12
    });

    test("should respect optimization mode differences", async () => {
      const valueResult = await findBestTransferPath({
        sourceProgramId: 1,
        destinationProgramIds: [5],
        mode: "value",
      });

      const timeResult = await findBestTransferPath({
        sourceProgramId: 1,
        destinationProgramIds: [5],
        mode: "time",
      });

      const hopsResult = await findBestTransferPath({
        sourceProgramId: 1,
        destinationProgramIds: [5],
        mode: "hops",
      });

      // All should find a path, but potentially different paths
      expect(valueResult).not.toBeNull();
      expect(timeResult).not.toBeNull();
      expect(hopsResult).not.toBeNull();

      // Value and hops should both choose 1 -> 3 -> 5
      expect(valueResult?.path).toEqual([1, 3, 5]);
      expect(hopsResult?.path).toEqual([1, 3, 5]);
    });
  });

  describe("Path Reconstruction", () => {
    test("should return correct path order", async () => {
      const result = await findBestTransferPath({
        sourceProgramId: 1,
        destinationProgramIds: [4],
        mode: "value",
      });

      expect(result).not.toBeNull();
      expect(result?.path[0]).toBe(1); // Start at source
      expect(result?.path[result.path.length - 1]).toBe(4); // End at destination

      // Each step should be connected
      for (let i = 0; i < result!.path.length - 1; i++) {
        const from = result!.path[i];
        const to = result!.path[i + 1];
        const pathExists = mockTransferPaths.some(
          (p) => p.from_program_id === from && p.to_program_id === to
        );
        expect(pathExists).toBe(true);
      }
    });
  });
});
