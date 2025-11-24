// service/inbound/query/useShops.ts
import { useQuery } from "@tanstack/react-query";
import type { ShopItem } from "@/domain/shop/types";

const MOCK_SHOP_ITEMS: ShopItem[] = [
  {
    id: 1,
    name: "스타터 간식 패키지",
    description: "펫 호감도 +10, 경험치 +50",
    price: 500,
    // currency: "coin",        // ❌ 이 필드는 타입에 없으니 제거
    category: "consumable", // ✅ 타입에 있는 값만 사용
    iconUrl: "images/shop/snack_pack.png",
  },
  {
    id: 2,
    name: "럭키 박스",
    description: "무작위 보상이 들어있는 상자",
    price: 1000,
    // currency: "coin",        // ❌ 제거
    // category: "box",         // ❌ 허용 안 되는 값
    category: "cosmetic", // ✅ "cosmetic" | "pose" | "consumable" 중 하나로 변경
    iconUrl: "images/shop/lucky_box.png",
  },
];

export function useShops() {
  return useQuery<ShopItem[]>({
    queryKey: ["shops"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return MOCK_SHOP_ITEMS;
    },
    retry: 0,
  });
}
