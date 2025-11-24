// service/inbound/query/useShops.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buyShopItem, getShopItems } from "@/service/api/shop";

export const shopKeys = {
  all: ["shop"] as const,
  items: () => [...shopKeys.all, "items"] as const,
};

export function useShopItemsQuery() {
  return useQuery({
    queryKey: shopKeys.items(),
    queryFn: () => getShopItems(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useBuyShopItemMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      buyShopItem(itemId, quantity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shopKeys.items() });
      qc.invalidateQueries({ queryKey: ["inventory", "mine"] });
    },
  });
}
