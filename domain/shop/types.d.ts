/**
 * @file Shop 도메인 관련 타입 정의
 */

/**
 * 상점에서 판매하는 아이템의 카테고리를 정의합니다.
 * - 'cosmetic': 애완동물의 외형을 변경하는 치장 아이템 (예: 모자, 옷)
 * - 'pose': 애완동물의 새로운 애니메이션이나 자세를 추가하는 아이템 (예: 춤추기, 앉기)
 * - 'consumable': 사용 시 특정 효과를 부여하는 소모성 아이템 (예: 성장 가속)
 */
export type ShopItemCategory = "cosmetic" | "pose" | "consumable";

/**
 * 상점에서 판매하는 개별 아이템의 기본 정보를 나타내는 타입입니다.
 */
export interface ShopItemBase {
  id: string; // 아이템 고유 ID
  name: string; // 아이템 이름
  description: string; // 아이템 설명
  price: number; // 아이템 가격 (코인)
  category: ShopItemCategory; // 아이템 카테고리
  iconUrl?: string; // 아이템 아이콘 이미지 URL 또는 로컬 에셋 경로
  requiredLevel?: number; // 구매 또는 사용에 필요한 애완동물 최소 레벨 (선택적)
}

/**
 * 치장 아이템의 상세 정보를 나타내는 타입입니다.
 * @augments ShopItemBase
 */
export interface CosmeticShopItem extends ShopItemBase {
  category: "cosmetic";
  // 치장 아이템 관련 추가 속성 (예: 장착 부위, 3D 모델 변경 정보 등)
  // part?: 'head' | 'body' | 'accessory';
  // modelChangeId?: string;
}

/**
 * 자세 아이템의 상세 정보를 나타내는 타입입니다.
 * @augments ShopItemBase
 */
export interface PoseShopItem extends ShopItemBase {
  category: "pose";
  animationName: string; // 이 아이템을 통해 해금되는 애완동물 애니메이션의 이름 (PetAnimationType과 연관)
}

/**
 * 소모성 아이템(예: 가속 성장)의 상세 정보를 나타내는 타입입니다.
 * @augments ShopItemBase
 */
export interface ConsumableShopItem extends ShopItemBase {
  category: "consumable";
  durationHours?: number; // 효과 지속 시간 (시간 단위, 예: 24시간 성장 속도 2배)
  effectMultiplier?: number; // 효과 배율 (예: 2배 성장)
  // effectType: 'growth_boost' | 'xp_boost'; // 효과 종류
}

/**
 * 상점에서 판매될 수 있는 모든 아이템 타입을 통합한 유니온 타입입니다.
 */
export type ShopItem = CosmeticShopItem | PoseShopItem | ConsumableShopItem;

/**
 * 사용자의 현재 코인 잔액 정보를 나타내는 타입입니다.
 */
export type UserCoinBalance = {
  currentCoins: number;
};
