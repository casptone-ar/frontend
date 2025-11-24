// service/api/shop.ts
import { API } from "@/service/lib/Http/adapter";

// 상점 아이템 목록
export async function getShopItems() {
  // TODO: baseURL에 /v1 들어있으면 아래 /v1는 제거
  return API.get<any[]>("/v1/shop/items");
}

// 아이템 구매
export async function buyShopItem(itemId: number, quantity: number) {
  return API.post<any>(`/v1/shop/items/${itemId}/buy`, { quantity });
}
