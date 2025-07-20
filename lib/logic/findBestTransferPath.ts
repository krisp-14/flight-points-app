import { supabase } from "@/lib/supabase"; // or wherever your Supabase client is

export async function findBestTransferPath({
  sourceProgramId,
  destinationProgramIds,
  mode,
}: {
  sourceProgramId: number;
  destinationProgramIds: number[];
  mode: "value" | "time" | "hops";
}) {
  const { data: edges } = await supabase.from("transfer_paths").select("*");

  // TODO: Build graph and apply Dijkstra here

  return {
    path: [], // program IDs in order
    totalPoints: 0,
    totalTime: 0,
    warnings: [],
  };
}