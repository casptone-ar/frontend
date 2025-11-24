// service/inbound/query/useShops.ts

import { useQuery, useMutation } from "@tanstack/react-query";
import type { ShopItem } from "@/domain/shop/types";

// 🔹 화면에서 쓸 mock 상점 아이템들
const MOCK_SHOP_ITEMS: ShopItem[] = [
  {
    id: "1",
    name: "스타터 간식 패키지",
    description: "펫 호감도 +10, 경험치 +50",
    price: 500,
    category: "consumable",
    iconUrl: "images/shop/snack_pack.png",
  },
  {
    id: "2",
    name: "럭키 박스",
    description: "무작위 보상이 들어있는 상자",
    price: 1000,
    category: "cosmetic",
    iconUrl: "images/shop/lucky_box.png",
  },
];

// ✅ 상점 아이템 목록 조회 (mock)
export function useShopItemsQuery() {
  return useQuery<ShopItem[]>({
    queryKey: ["shop-items"],
    queryFn: async () => {
      // 로딩 느낌용 딜레이
      await new Promise((resolve) => setTimeout(resolve, 400));
      return MOCK_SHOP_ITEMS;
    },
    retry: 0,
  });
}

// ✅ 아이템 구매 (mock)
export function useBuyShopItemMutation() {
  return useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: number;
      quantity: number;
    }) => {
      console.log("[mock] buyShopItem", { itemId, quantity });
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true as const };
    },
  });
}
