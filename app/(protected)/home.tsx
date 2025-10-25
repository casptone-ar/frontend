// app/(protected)/home.tsx
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react"; // ✅ NEW: useEffect 추가
import { Alert, Platform } from "react-native"; // ✅ NEW: Platform 추가
import { Paragraph, Spinner, XStack, YStack } from "tamagui";

import { Button } from "@/View/core/Button/Button";
import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { Text } from "@/View/core/Text/Text";
import { Settings } from "@tamagui/lucide-icons";

import { MissionPreviewList } from "./components/home/MissionPreviewList";
import { PetInteractionArea } from "./components/home/PetInteractionArea";
import { PetStatusBar } from "./components/home/PetStatusBar";

// ✅ 도메인(UI) 타입
import type { MissionPreview as UiMissionPreview } from "@/domain/mission/types";
import type { CurrentPetStatus, PetStats } from "@/domain/pet/types";

// ✅ API 호출
import { getActivePet } from "@/service/api/pets";
import { getMissions } from "@/service/api/missions";

// ✅ 매퍼
import {
  mapUserPetToCurrentPetStatus,
  mapUserPetToPetStats,
  mapApiMissionsToUi,
} from "@/domain/mappers";

// ✅ NEW: 헬스 스토어
import { useHealth } from "@/View/store/healthStore";

export default function HomeScreen() {
  const router = useRouter();

  const [petStatus, setPetStatus] = useState<CurrentPetStatus | null>(null);
  const [petStats, setPetStats] = useState<PetStats>({
    level: 0,
    experience: 0,
    health: 0,
    happiness: 0,
  });
  const [missionPreviews, setMissionPreviews] = useState<UiMissionPreview[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMissions, setIsLoadingMissions] = useState(true);

  // ✅ NEW: 오늘 걸음수 상태
  const {
    todaySteps,
    isLoading: healthLoading,
    error: healthError,
    refreshToday,
  } = useHealth();

  const loadHomeScreenData = useCallback(async () => {
    setIsLoading(true);
    setIsLoadingMissions(true);
    try {
      const [apiUserPet, missionRes] = await Promise.all([
        getActivePet(), // UserPet | null
        getMissions("daily"), // { items: ApiMissionPreview[] }
      ]);

      // ✅ 매핑
      setPetStatus(mapUserPetToCurrentPetStatus(apiUserPet));
      setPetStats(mapUserPetToPetStats(apiUserPet));
      setMissionPreviews(mapApiMissionsToUi(missionRes.items ?? []));
    } catch (error) {
      console.error("Failed to load home screen data:", error);
      Alert.alert("오류", "홈 화면 데이터를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
      setIsLoadingMissions(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHomeScreenData();
      // ✅ NEW: 화면 포커스 때 걸음수도 갱신
      refreshToday();
      return () => {};
    }, [loadHomeScreenData, refreshToday])
  );

  // ✅ NEW: 첫 마운트 시에도 한 번 조회(옵션)
  useEffect(() => {
    refreshToday();
  }, [refreshToday]);

  const handlePetInteraction = () => {
    Alert.alert("야옹!", "애완동물이 당신을 바라봅니다.");
  };

  const handleNavigateToMissions = () => {
    router.push("/(protected)/missions");
  };

  const handleMissionPreviewPress = (missionId: string) => {
    Alert.alert("미션 선택됨", `미션 ID: ${missionId} (상세보기 구현 필요)`);
  };

  if (isLoading && !petStatus && missionPreviews.length === 0) {
    return (
      <ScreenContainer scrollable={false} safeAreaTop={false}>
        <YStack f={1} jc="center" ai="center" space>
          <Spinner size="large" color="$accent1" />
          <Paragraph color="$text2">데이터를 불러오는 중...</Paragraph>
        </YStack>
      </ScreenContainer>
    );
  }

  const petName = petStatus?.name ?? "애완동물";
  const expToNextLevel = petStatus?.experienceToNextLevel ?? 100;

  return (
    <ScreenContainer scrollable safeAreaTop={false}>
      <YStack space="$md" p="$lg">
        <XStack py={"$xl"} px={0} jc="space-between" ai="center" pb={"$sm"}>
          <Text type="h2">Home</Text>
          <Button
            boc={"$border1"}
            bg={"transparent"}
            color={"$text1"}
            px={"$3"}
            iconAfter={<Settings size={24} color="$text2" />}
            onPress={() => router.push("/(protected)/settings")}
          />
        </XStack>

        <PetInteractionArea
          petStatus={petStatus}
          isLoading={!petStatus && isLoading}
          onPetInteract={handlePetInteraction}
        />

        <PetStatusBar
          name={petName}
          stats={petStats}
          experienceToNextLevel={expToNextLevel}
          isLoading={!petStatus && isLoading}
        />

        {/* ✅ NEW: 오늘의 걸음수 카드 (iOS 우선 노출) */}
        {Platform.OS === "ios" && (
          <YStack gap="$xs" bg="$color3" p="$md" borderRadius="$md">
            <Text type="bodyLarge">오늘의 걸음수</Text>
            {healthError ? (
              <Text type="bodySmall" colorVariant="error">
                건강 데이터 권한이 필요합니다. 설정에서 허용해주세요.
              </Text>
            ) : (
              <Text type="bodySmall" colorVariant="secondary">
                {healthLoading
                  ? "로딩 중..."
                  : `${todaySteps.toLocaleString()} 보`}
              </Text>
            )}
            <XStack jc="flex-end">
              <Button
                size="sm"
                variant="ghost"
                onPress={refreshToday}
                disabled={healthLoading}
              >
                새로고침
              </Button>
            </XStack>
          </YStack>
        )}

        <MissionPreviewList
          title="진행 중인 미션"
          missions={missionPreviews}
          isLoading={isLoadingMissions}
          onViewAllPress={handleNavigateToMissions}
          onMissionPress={handleMissionPreviewPress}
        />

        <YStack gap="$xs" bg={"$accent5"} p="$md" borderRadius="$md">
          <Text type="bodyLarge">오늘의 팁!</Text>
          <Text type="bodySmall" colorVariant="secondary">
            꾸준한 걸음으로 애완동물과 함께 건강해지세요!
          </Text>
        </YStack>
      </YStack>
    </ScreenContainer>
  );
}
