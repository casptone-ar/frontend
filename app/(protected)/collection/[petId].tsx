import type { CollectedPet, MissionTimeline } from "@/domain/collection/types";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Alert, ScrollView } from "react-native";
import { Button, H3, Paragraph, Separator, Spinner, YStack } from "tamagui";
import { MissionTimelineView } from "../components/collection/MissionTimelineView"; // 이전 파일명과 일치 확인
import { PetDetailView } from "../components/collection/PetDetailView";

// --- Mock Data & Service ---
// MOCK_COLLECTED_PETS는 collection/index.tsx의 것을 참조한다고 가정
const MOCK_COLLECTED_PETS_DETAIL_VIEW: CollectedPet[] = [
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
];

const MOCK_TIMELINES: Record<string, MissionTimeline> = {
  timeline_dog001_ascended_1: {
    id: "timeline_dog001_ascended_1",
    petId: "dog001_ascended_1",
    startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    events: [
      {
        id: "event1",
        timestamp: new Date(
          Date.now() - 19 * 24 * 60 * 60 * 1000
        ).toISOString(),
        type: "mission_completed",
        title: "첫 걸음마 미션 완료!",
        description: "500보 걷기 달성.",
        details: { rewardCoin: 5 },
      },
      {
        id: "event2",
        timestamp: new Date(
          Date.now() - 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
        type: "level_up",
        title: "레벨 2 달성!",
        details: { achievedLevel: 2 },
      },
      {
        id: "event3",
        timestamp: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
        type: "ascension",
        title: "승천!",
        description: "레벨 10에 도달하여 새로운 시작을 맞이합니다.",
        details: { achievedLevel: 10 },
      },
    ],
  },
  timeline_cat001_ascended_1: {
    id: "timeline_cat001_ascended_1",
    petId: "cat001_ascended_1",
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    events: [
      // ... 냥이의 이벤트들
    ],
  },
};

const fetchCollectedPetDetail = async (
  collectedPetId: string
): Promise<CollectedPet | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pet = MOCK_COLLECTED_PETS_DETAIL_VIEW.find(
        (p) => p.id === collectedPetId
      );
      resolve(pet || null);
    }, 300);
  });
};

const fetchMissionTimeline = async (
  timelineId: string
): Promise<MissionTimeline | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_TIMELINES[timelineId] || null);
    }, 400);
  });
};
// --- End Mock Data & Service ---

/**
 * 컬렉션에 등록된 특정 애완동물의 상세 정보를 보여주는 화면입니다.
 * 애완동물의 3D 모델(또는 이미지)과 함께 해당 애완동물과 관련된 미션 타임라인을 표시합니다.
 */
export default function CollectedPetDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { petId: collectedPetRouteId } = useLocalSearchParams<{
    petId: string;
  }>(); // 경로 파라미터 (CollectedPet의 id)

  const [petDetail, setPetDetail] = useState<CollectedPet | null>(null);
  const [timeline, setTimeline] = useState<MissionTimeline | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    if (petDetail) {
      navigation.setOptions({ title: `${petDetail.name}의 기록` });
    }
  }, [navigation, petDetail]);

  const loadData = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        // TODO: application/collection/... 훅 사용
        const fetchedPetDetail = await fetchCollectedPetDetail(id);
        setPetDetail(fetchedPetDetail);

        if (fetchedPetDetail?.missionTimelineId) {
          const fetchedTimeline = await fetchMissionTimeline(
            fetchedPetDetail.missionTimelineId
          );
          setTimeline(fetchedTimeline);
        } else if (fetchedPetDetail) {
          console.warn(
            `No mission timeline ID for pet: ${fetchedPetDetail.name}`
          );
        } else {
          Alert.alert("오류", "애완동물 정보를 찾을 수 없습니다.");
          router.back();
          return;
        }
      } catch (error) {
        console.error("Failed to load pet detail or timeline:", error);
        Alert.alert("오류", "상세 정보를 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (collectedPetRouteId) {
      loadData(collectedPetRouteId);
    } else {
      Alert.alert("오류", "잘못된 접근입니다.");
      router.back();
    }
  }, [collectedPetRouteId, loadData, router]);

  if (isLoading) {
    return (
      <YStack f={1} jc="center" ai="center" space="$2">
        <Spinner />
        <Paragraph>상세 정보 로딩 중...</Paragraph>
      </YStack>
    );
  }

  if (!petDetail) {
    // 로딩이 끝났는데 petDetail이 없으면 (오류로 인해)
    return (
      <YStack f={1} jc="center" ai="center" space="$2" p="$4">
        <Paragraph>애완동물 정보를 표시할 수 없습니다.</Paragraph>
        <Button onPress={() => router.back()}>목록으로 돌아가기</Button>
      </YStack>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <YStack f={1} space="$3" p="$3">
        <PetDetailView pet={petDetail} />
        <Separator />
        <H3>성장 일지</H3>
        {timeline && timeline.events.length > 0 ? (
          <MissionTimelineView timeline={timeline} />
        ) : timeline ? (
          <Paragraph color="$color10">기록된 성장 일지가 없습니다.</Paragraph>
        ) : (
          <Paragraph color="$color10">
            타임라인 정보를 불러오는 중이거나 없습니다.
          </Paragraph>
        )}
      </YStack>
    </ScrollView>
  );
}
