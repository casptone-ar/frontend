// domain/pet/assets.ts

// 🐾 2D 썸네일 (홈 화면, 리스트, AR 오버레이용)
export const PET_IMAGE_ASSETS = {
  cat: require("@/assets/pets/cat.png"),
} as const;

export type PetImageKey = keyof typeof PET_IMAGE_ASSETS;

// 🐾 AR에서 사용하는 스프라이트 자산 (지금은 2D 이미지랑 동일하게 사용)
export const PET_SPRITE_ASSETS = PET_IMAGE_ASSETS;
export type PetSpriteKey = keyof typeof PET_SPRITE_ASSETS;
