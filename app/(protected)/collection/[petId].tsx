// app/(protected)/collection/[petId].tsx
import { useEffect, useMemo } from "react";
import { Alert, ScrollView } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Button, H3, Paragraph, Separator, Spinner, YStack } from "tamagui";
import { useStore } from "zustand";

import { collectionStore } from "@/View/store/collectionStore";
import { MissionTimelineView } from "../components/collection/MissionTimelineView";
import { PetDetailView } from "../components/collection/PetDetailView";

// ✅ 도메인(UI) 타입
import type {
  CollectedPet,
  MissionTimeline,
  TimelineEvent,
} from "@/domain/collection/types";

// ✅ API 원본 타입
import type { MissionTimelineEvent as ApiMissionTimelineEvent } from "@/service/api/types";

/** selectedCollection → CollectedPet 매핑 */
const mapSelectedToCollectedPet = (selected: {
  id: number;
  nickname: string;
  ascendedAt: string;
}): CollectedPet => ({
  id: String(selected.id),
  // ⚠ petId는 아직 백엔드에서 별도로 안 받아오니까
  //   일단 collection id를 그대로 string으로 써줌 (나중에 pet_id 필드 생기면 교체)
  petId: String(selected.id),
  name: selected.nickname,
  description: "승천한 애완동물의 기록입니다.",
  ascendedAt: selected.ascendedAt,
  finalLevel: 0, // 백엔드에서 최종 레벨 안 주면 0 또는 undefined로 처리
  thumbnailUrl: "",
});

/** API MissionTimelineEvent → UI TimelineEvent 매핑 */
const mapApiEventToTimelineEvent = (
  e: ApiMissionTimelineEvent
): TimelineEvent => ({
  id: e.id,
  timestamp: e.timestamp,
  // ⚠ 여기서는 백엔드가 "mission_completed" | "level_up" | "item_acquired" | "ascension"
  // 중 하나를 준다고 가정하고 타입 단언을 한다.
  // 만약 실제 값이 다르면 union 타입을 string으로 바꾸거나 여기서 매핑 규칙을 정해야 함.
  type: e.type as TimelineEvent["type"],
  title: e.title,
  description: e.description,
  details: e.details,
  // icon은 필요해지면 type에 따라 나중에 매핑
});

export default function CollectedPetDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { petId } = useLocalSearchParams<{ petId: string }>();

  const { selectedCollection, isLoading, error, fetchCollectionDetail } =
    useStore(collectionStore);

  // 데이터 로딩
  useEffect(() => {
    if (!petId) {
      Alert.alert("오류", "잘못된 접근입니다.");
      router.back();
      return;
    }

    const id = Number(petId);
    fetchCollectionDetail(id).catch((err) => {
      console.error("컬렉션 상세 로드 실패:", err);
      Alert.alert("오류", "컬렉션 상세를 불러오는 중 문제가 발생했습니다.");
      router.back();
    });
  }, [petId, fetchCollectionDetail, router]);

  // 헤더 제목 갱신
  useEffect(() => {
    if (selectedCollection?.nickname) {
      navigation.setOptions({
        title: `${selectedCollection.nickname}의 성장 일지`,
      } as any);
    }
  }, [navigation, selectedCollection?.nickname]);

  // ✅ UI용 pet / timeline 미리 계산
  const uiPet: CollectedPet | undefined = useMemo(() => {
    if (!selectedCollection) return undefined;
    return mapSelectedToCollectedPet(selectedCollection);
  }, [selectedCollection]);

  const uiTimeline: MissionTimeline | undefined = useMemo(() => {
    if (!selectedCollection) return undefined;
    const events: TimelineEvent[] = selectedCollection.timeline.map(
      mapApiEventToTimelineEvent
    );
    return {
      id: String(selectedCollection.id),
      petId: uiPet?.petId ?? String(selectedCollection.id),
      events,
      // startDate, endDate 는 백엔드에서 아직 안 받으니까 생략
    };
  }, [selectedCollection, uiPet]);

  if (isLoading && !selectedCollection) {
    return (
      <YStack f={1} jc="center" ai="center" space="$2">
        <Spinner />
        <Paragraph>상세 정보 로딩 중...</Paragraph>
      </YStack>
    );
  }

  if (error || !selectedCollection || !uiPet) {
    return (
      <YStack f={1} jc="center" ai="center" space="$3" p="$4">
        <Paragraph>{error || "상세 정보를 표시할 수 없습니다."}</Paragraph>
        <Button onPress={() => router.back()}>목록으로 돌아가기</Button>
      </YStack>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <YStack f={1} space="$3" p="$3">
        {/* ✅ PetDetailView에는 CollectedPet 그대로 전달 */}
        <PetDetailView pet={uiPet} />

        <Separator />

        <H3>성장 일지</H3>

        {uiTimeline && uiTimeline.events.length > 0 ? (
          <MissionTimelineView timeline={uiTimeline} />
        ) : (
          <Paragraph color="$color10">기록된 성장 일지가 없습니다.</Paragraph>
        )}
      </YStack>
    </ScrollView>
  );
}
