// service/api/inventory.ts
import { API } from "@/service/lib/Http/adapter";

// 내 인벤토리 목록
export async function getMyInventory() {
  return API.get<any[]>("/v1/inventory");
}
