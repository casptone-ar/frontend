// app/(protected)/collection/index.tsx

import { useEffect, useMemo } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { H2, Paragraph, Separator, Spinner, YStack } from "tamagui";
import { useStore } from "zustand";

import type { CollectedPet } from "@/domain/collection/types";
import type { UserCollection } from "@/service/api/types";
import { collectionStore } from "@/View/store/collectionStore";
import { CollectedPetGrid } from "../components/collection/CollectedPetGrid";

// UserCollection → CollectedPet 매핑 함수
const mapToCollectedPet = (c: UserCollection): CollectedPet => ({
  id: String(c.user_collection_id),
  petId: String(c.pet_master_id), // ⚠ 실제 pet_id 필드가 생기면 거기로 교체
  name: c.ascended_nickname,
  description: "", // 백엔드에서 아직 설명 안 주면 일단 빈 문자열
  ascendedAt: c.ascended_at,
  finalLevel: 0, // 백엔드에서 레벨 안 주면 0으로 두거나, 나중에 필드 추가되면 교체
  // modelUrl, thumbnailUrl, missionTimelineId 등은 나중에 필요해지면 채우기
});

export default function CollectionScreen() {
  const router = useRouter();
  const { collections, isLoading, error, fetchCollections } =
    useStore(collectionStore);

  // 첫 진입 시 컬렉션 목록 불러오기
  useEffect(() => {
    fetchCollections().catch((err) => {
      console.error("컬렉션 로드 실패:", err);
      Alert.alert("오류", "컬렉션 정보를 불러오는 중 문제가 발생했습니다.");
    });
  }, [fetchCollections]);

  // API 원본(UserCollection[]) → UI용(CollectedPet[]) 변환
  const collectedPets: CollectedPet[] = useMemo(
    () => collections.map(mapToCollectedPet),
    [collections]
  );

  const handleSelectPet = (pet: CollectedPet) => {
    // [petId].tsx 라우트로 이동
    router.push(`/collection/${pet.id}`);
  };

  if (isLoading && collections.length === 0) {
    return (
      <YStack f={1} jc="center" ai="center" space="$2">
        <Spinner />
        <Paragraph>컬렉션 로딩 중...</Paragraph>
      </YStack>
    );
  }

  if (error && collections.length === 0) {
    return (
      <YStack f={1} jc="center" ai="center" space="$3" p="$4">
        <Paragraph color="$red10">오류: {error}</Paragraph>
        <Paragraph color="$color11">잠시 후 다시 시도해 주세요.</Paragraph>
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
