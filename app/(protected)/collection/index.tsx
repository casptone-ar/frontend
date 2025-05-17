import type { CollectedPet } from "@/domain/collection/types";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { H2, Paragraph, Separator, Spinner, YStack } from "tamagui";
import { CollectedPetGrid } from "../components/collection/CollectedPetGrid";

// --- Mock Data & Service ---
const MOCK_COLLECTED_PETS: CollectedPet[] = [
  {
    id: "collected_pet_001",
    petId: "dog001_ascended_1",
    name: "용감한 댕댕이",
    description: "첫 번째로 승천한 전설의 댕댕이",
    modelUrl: "models/legend_dog.glb",
    thumbnailUrl: "thumbnails/legend_dog_thumb.png", // 실제 썸네일 경로
    ascendedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10일 전
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
    ascendedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5일 전
    finalLevel: 10,
    missionTimelineId: "timeline_cat001_ascended_1",
  },
  // ... 더 많은 승천 펫 데이터
];

const fetchCollectedPets = async (): Promise<CollectedPet[]> => {
  return new Promise((resolve) =>
    setTimeout(() => resolve(MOCK_COLLECTED_PETS), 600)
  );
};
// --- End Mock Data & Service ---

/**
 * 컬렉션(동물농장) 메인 화면입니다.
 * 사용자가 승천시킨 애완동물들의 목록을 그리드 형태로 보여줍니다.
 * 각 애완동물을 선택하면 상세 정보 화면으로 이동합니다.
 */
export default function CollectionScreen() {
  const router = useRouter();
  const [collectedPets, setCollectedPets] = useState<CollectedPet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCollectedPets = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: 실제 application/collection/useCollectedPets.ts 훅 사용
      const pets = await fetchCollectedPets();
      setCollectedPets(pets);
    } catch (error) {
      console.error("Failed to load collected pets:", error);
      Alert.alert("오류", "컬렉션 정보를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCollectedPets();
    }, [loadCollectedPets])
  );

  const handleSelectPet = (pet: CollectedPet) => {
    // pet.id는 CollectedPet의 id, pet.petId는 원본 Pet의 id일 수 있음.
    // 여기서는 CollectedPet의 id (승천 기록 ID)를 상세 페이지로 전달한다고 가정합니다.
    router.push(`/collection/${pet.id}`);
  };

  if (isLoading) {
    return (
      <YStack f={1} jc="center" ai="center" space="$2">
        <Spinner />
        <Paragraph>컬렉션 로딩 중...</Paragraph>
      </YStack>
    );
  }

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
