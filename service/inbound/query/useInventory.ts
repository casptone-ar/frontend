// service/inbound/query/useInventory.ts
import { useQuery } from "@tanstack/react-query";
import { getMyInventory } from "@/service/api/inventory";

export const inventoryKeys = {
  all: ["inventory"] as const,
  mine: () => [...inventoryKeys.all, "mine"] as const,
};

export function useMyInventoryQuery() {
  return useQuery({
    queryKey: inventoryKeys.mine(),
    queryFn: () => getMyInventory(),
    staleTime: 1000 * 60 * 2,
  });
}
