// app/(protected)/home.tsx
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { Paragraph, Spinner, XStack, YStack } from "tamagui";

import { Button } from "@/View/core/Button/Button";
import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { Text } from "@/View/core/Text/Text";
import { Settings } from "@tamagui/lucide-icons";

import { MissionPreviewList } from "./components/home/MissionPreviewList";
import { PetInteractionArea } from "./components/home/PetInteractionArea";
import { PetStatusBar } from "./components/home/PetStatusBar";

import type { MissionPreview as UiMissionPreview } from "@/domain/mission/types";
import type { CurrentPetStatus, PetStats } from "@/domain/pet/types";

import { getActivePet } from "@/service/api/pets";
import { getMissions } from "@/service/api/missions";
import {
  mapUserPetToCurrentPetStatus,
  mapUserPetToPetStats,
  mapApiMissionsToUi,
} from "@/domain/mappers";

// ✅ 헬스 스토어 가져오기
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

  // ✅ 헬스 스토어에서 필요한 상태와 동기화 함수 가져오기
  const {
    todaySteps,
    isLoading: healthLoading,
    error: healthError,
    refreshToday,
    syncSteps, // 🆕 추가: 서버로 걸음 수 전송
  } = useHealth();

  const loadHomeScreenData = useCallback(async () => {
    setIsLoading(true);
    setIsLoadingMissions(true);
    try {
      const [apiUserPet, missionRes] = await Promise.all([
        getActivePet(),
        getMissions("daily"),
      ]);

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

  // ✅ 화면 진입 시: 데이터 + 걸음 동기화 모두 실행
  useFocusEffect(
    useCallback(() => {
      (async () => {
        await loadHomeScreenData();

        // ✅ HealthKit에서 최신 걸음 읽기
        await refreshToday();

        // ✅ NEW: 서버로 증분 걸음 전송 (경험치 반영)
        await syncSteps();
      })();

      return () => {};
    }, [loadHomeScreenData, refreshToday, syncSteps])
  );

  // ✅ 첫 마운트 시에도 1회 실행 (선택 사항)
  useEffect(() => {
    (async () => {
      await refreshToday();
      await syncSteps(); // 🆕 추가
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
                  await syncSteps(); // ✅ 새로고침 시에도 서버 전송
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
