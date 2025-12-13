// service/api/shop.ts
import type { ShopItem } from "@/domain/shop/types";

// 🔹 mock 데이터는 ShopItem 타입 그대로 구성
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
  {
    id: "food_001",
    name: "고급 반려동물 간식",
    description: "행복도 +20",
    price: 300,
    category: "consumable",
  },
  {
    id: "food_002",
    name: "일반 반려동물 간식",
    description: "행복도 +5",
    price: 300,
    category: "consumable",
  },
  {
    id: "hat_001",
    name: "귀여운 모자",
    description: "외형 치장용 아이템",
    price: 1500,
    category: "cosmetic",
    iconUrl: "images/shop/hat.png",
  },
];

// 상점 아이템 목록 (mock)
export async function getShopItems(): Promise<ShopItem[]> {
  await new Promise((r) => setTimeout(r, 400));
  return MOCK_SHOP_ITEMS;
}

// 아이템 구매 mock
export async function buyShopItem(itemId: number, quantity: number) {
  console.log("[mock] buy", itemId, quantity);
  await new Promise((r) => setTimeout(r, 300));
  return { success: true };
}
