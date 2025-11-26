// app/(protected)/home.tsx
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { Paragraph, Spinner, XStack, YStack } from "tamagui";

import { Button } from "@/View/core/Button/Button";
import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { Text } from "@/View/core/Text/Text";
import { Settings } from "@tamagui/lucide-icons";

import { MissionPreviewList } from "@/View/components/home/MissionPreviewList";
import { PetInteractionArea } from "@/View/components/home/PetInteractionArea";
import { PetStatusBar } from "@/View/components/home/PetStatusBar";

import type { MissionPreview as UiMissionPreview } from "@/domain/mission/types";
import type { CurrentPetStatus, PetStats } from "@/domain/pet/types";

// ✅ 헬스 스토어
import { useHealth } from "@/View/store/healthStore";

// ✅ 홈 화면용 목 데이터
const MOCK_PET_STATUS: CurrentPetStatus = {
  id: "1",
  name: "네오",
  level: 1,
  experience: 0,
  experienceToNextLevel: 200,
  imageUrl: require("@/assets/pets/cat.png"),
};

const MOCK_PET_STATS: PetStats = {
  level: 1,
  experience: 120,
  health: 80,
  happiness: 90,
};

const MOCK_MISSIONS: UiMissionPreview[] = [
  {
    id: "mission_1",
    title: "오늘 3,000보 걷기",
    statusText: "1,500 / 3,000보 진행 중",
    typeText: "일일 미션",
    actionRequired: false,
    // iconUrl: "https://..."  // 필요하면 나중에 추가
  },
  {
    id: "mission_2",
    title: "상점에서 아이템 하나 사기",
    statusText: "잠금 상태",
    typeText: "주간 미션",
    actionRequired: false,
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const [petStatus, setPetStatus] = useState<CurrentPetStatus | null>(
    MOCK_PET_STATUS
  );
  const [petStats, setPetStats] = useState<PetStats>(MOCK_PET_STATS);
  const [missionPreviews, setMissionPreviews] =
    useState<UiMissionPreview[]>(MOCK_MISSIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMissions, setIsLoadingMissions] = useState(false);

  // ✅ 헬스 스토어에서 필요한 상태와 동기화 함수 가져오기
  const {
    todaySteps,
    isLoading: healthLoading,
    error: healthError,
    refreshToday,
    syncSteps,
  } = useHealth();

  const loadHomeScreenData = useCallback(async () => {
    setIsLoading(true);
    setIsLoadingMissions(true);
    try {
      // 여기서는 그냥 목 데이터 다시 세팅만 해줌
      await new Promise((r) => setTimeout(r, 400));
      setPetStatus(MOCK_PET_STATUS);
      setPetStats(MOCK_PET_STATS);
      setMissionPreviews(MOCK_MISSIONS);
    } catch (error) {
      console.error("Failed to load home screen data (mock):", error);
      Alert.alert("오류", "홈 화면 데이터를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
      setIsLoadingMissions(false);
    }
  }, []);

  // ✅ 화면 진입 시: 데이터 + 걸음 동기화
  useFocusEffect(
    useCallback(() => {
      (async () => {
        await loadHomeScreenData();
        await refreshToday();
        await syncSteps();
      })();

      return () => {};
    }, [loadHomeScreenData, refreshToday, syncSteps])
  );

  // ✅ 첫 마운트 시에도 1회 실행
  useEffect(() => {
    (async () => {
      await refreshToday();
      await syncSteps();
    })();
  }, [refreshToday, syncSteps]);

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

        {/* ✅ 오늘의 걸음수 카드 */}
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
                onPress={async () => {
                  await refreshToday();
                  await syncSteps();
                }}
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
