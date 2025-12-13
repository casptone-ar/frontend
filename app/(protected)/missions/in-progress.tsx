// app/(protected)/missions/in-progress.tsx

import { useMemo } from "react";
import { useRouter } from "expo-router";
import { ArrowLeft, MoreVertical } from "@tamagui/lucide-icons";
import { Button as TamaguiButton, XStack, YStack } from "tamagui";

import { Button } from "@/View/core/Button/Button";
import { Card } from "@/View/core/Card/Card";
import { Header } from "@/View/core/Header/Header";
import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { Text } from "@/View/core/Text/Text";
import { MissionList } from "@/View/components/missions/MissionList";
import { useMissionStore } from "@/View/store/missionStore";

export default function InProgressMissionsScreen() {
  const router = useRouter();
  const { missions } = useMissionStore();

  const inProgressMissions = useMemo(
    () => missions.filter((m) => m.status === "in-progress"),
    [missions]
  );

  const dailyCount = inProgressMissions.filter(
    (m) => m.type === "daily"
  ).length;
  const weeklyCount = inProgressMissions.filter(
    (m) => m.type === "weekly"
  ).length;

  const handleMissionPress = (id: string) => {
    router.push(`/(protected)/missions/${id}`);
  };

  return (
    <ScreenContainer scrollable={false} safeAreaBottom>
      <Header
        title="진행중"
        leftAction={
          <TamaguiButton
            chromeless
            circular
            size="$3"
            backgroundColor="$background3"
            pressStyle={{ backgroundColor: "$color4", opacity: 0.9 }}
            onPress={() => router.canGoBack() && router.back()}
            icon={<ArrowLeft size={20} color="$text1" />}
          />
        }
        rightAction={
          <TamaguiButton
            chromeless
            circular
            size="$3"
            backgroundColor="$background3"
            pressStyle={{ backgroundColor: "$color4", opacity: 0.9 }}
            onPress={() => router.push("/(protected)/missions")}
            icon={<MoreVertical size={20} color="$text1" />}
          />
        }
        borderBottom={false}
      />

      <YStack px="$md" pt="$sm" gap="$md" flex={1}>
        <Card
          bg="$background2"
          bw={1}
          boc="$color4"
          br="$xl"
          shop={0}
          p="$lg"
          gap="$sm"
        >
          <Text type="h4">지금 진행 중</Text>
          <Text type="caption" colorVariant="secondary">
            현재 {inProgressMissions.length}개의 미션을 진행하고 있어요. (주행/업로드 중심 ·
            일일 {dailyCount} / 주간 {weeklyCount})
          </Text>

          <XStack jc="flex-end">
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.push("/(protected)/missions")}
            >
              전체 미션 보기
            </Button>
          </XStack>
        </Card>

        <YStack flex={1}>
          <MissionList
            missions={inProgressMissions}
            isLoading={false}
            onMissionAction={handleMissionPress}
            emptyListText="진행 중인 미션이 없습니다. 새로운 미션을 시작해보세요!"
            contentContainerStyle={{ paddingVertical: 12, paddingBottom: 28 }}
          />
        </YStack>
      </YStack>
    </ScreenContainer>
  );
}
