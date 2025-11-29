// app/(protected)/collection/index.tsx

import { useState } from "react";
import { useRouter } from "expo-router";
import { H2, Paragraph, Separator, YStack } from "tamagui";

import type { CollectedPet } from "@/domain/collection/types";
import { CollectedPetGrid } from "@/View/components/collection/CollectedPetGrid";

// 🔹 컬렉션 목 데이터 (3개 정도 예시)
const MOCK_COLLECTED_PETS: CollectedPet[] = [
  {
    id: "collected_pet_001",
    petId: "dog001_ascended_1",
    name: "용감한 댕댕이",
    description: "첫 번째로 승천한 전설의 댕댕이",
    modelUrl: "models/legend_dog.glb",
    thumbnailUrl: "thumbnails/legend_dog_thumb.png",
    ascendedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    finalLevel: 10,
    missionTimelineId: "timeline_dog001_ascended_1",
  },
  {
    id: "collected_pet_002",
    petId: "cat001_ascended_1",
    name: "지혜로운 냥이",
    description: "많은 미션을 클리어하고 승천한 고양이",
    modelUrl: "models/wise_cat.glb",
    thumbnailUrl: "thumbnails/wise_cat_thumb.png",
    ascendedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    finalLevel: 10,
    missionTimelineId: "timeline_cat001_ascended_1",
  },
  {
    id: "collected_pet_003",
    petId: "rabbit001_ascended_1",
    name: "점프하는 토끼",
    description: "언덕을 뛰어다니며 성장한 토끼",
    modelUrl: "models/jump_rabbit.glb",
    thumbnailUrl: "thumbnails/jump_rabbit_thumb.png",
    ascendedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    finalLevel: 7,
    missionTimelineId: "timeline_rabbit001_ascended_1",
  },
];

export default function CollectionScreen() {
  const router = useRouter();
  // 🔹 지금은 그냥 고정 목 데이터 사용
  const [collectedPets] = useState<CollectedPet[]>(MOCK_COLLECTED_PETS);

  const handleSelectPet = (pet: CollectedPet) => {
    router.push(`/collection/${pet.id}`);
  };

  return (
    <YStack f={1} pt="$2">
      <YStack px="$4" pb="$2">
        <H2>나의 동물농장</H2>
        <Paragraph color="$color11">
          승천한 애완동물들을 여기서 다시 만나보세요.
        </Paragraph>
      </YStack>

      <Separator />

      {collectedPets.length > 0 ? (
        <CollectedPetGrid pets={collectedPets} onSelectPet={handleSelectPet} />
      ) : (
        <YStack f={1} jc="center" ai="center" p="$4">
          <Paragraph>아직 승천한 애완동물이 없습니다.</Paragraph>
          <Paragraph color="$color10">
            애완동물을 성장시켜 승천시키면 여기에 기록됩니다!
          </Paragraph>
        </YStack>
      )}
    </YStack>
  );
}
