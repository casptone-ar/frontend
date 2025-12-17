// app/(protected)/missions/[id].tsx

import { useEffect, useMemo } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, MoreVertical } from "@tamagui/lucide-icons";
import { Button as TamaguiButton, Progress, XStack, YStack } from "tamagui";

import { Button } from "@/View/core/Button/Button";
import { Card } from "@/View/core/Card/Card";
import { Chip } from "@/View/core/Chip/Chip";
import { Header } from "@/View/core/Header/Header";
import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { Text } from "@/View/core/Text/Text";
import { useMissionStore } from "@/View/store/missionStore";

import type { Mission } from "@/domain/mission/types";

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
};

const getStatusChipColor = (status: Mission["status"]) => {
  switch (status) {
    case "pending":
      return "gray" as const;
    case "in-progress":
      return "primary" as const;
    case "completed":
      return "success" as const;
    case "failed":
      return "error" as const;
    default:
      return "gray" as const;
  }
};

const getStatusLabel = (status: Mission["status"]) => {
  switch (status) {
    case "pending":
      return "대기";
    case "in-progress":
      return "진행중";
    case "completed":
      return "완료";
    case "failed":
      return "실패";
    default:
      return "알 수 없음";
  }
};

const getTypeLabel = (type: Mission["type"]) => {
  return type === "daily" ? "일일" : "주간";
};

export default function MissionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    missions,
    startMission,
    incrementProgress,
    completeMission,
    getMissionById,
  } = useMissionStore();

  const handleStartMission = (id: string) => {
    if (!id) return;
    startMission(id);
    router.push(`/(protected)/ar`);
  };

  const mission = useMemo(() => {
    if (!id) return undefined;
    // getMissionById는 store의 get()을 사용하므로 missions 의존 없이도 최신값을 반환합니다.
    return getMissionById(id);
  }, [id, getMissionById, missions]);

  useEffect(() => {
    if (!id) {
      Alert.alert("오류", "잘못된 접근입니다.");
      router.back();
    }
  }, [id, router]);

  const progress = useMemo(() => {
    if (!mission) return { percent: 0, text: "-" };
    if (mission.targetValue === undefined) {
      return { percent: mission.status === "completed" ? 100 : 0, text: "-" };
    }
    const current = mission.currentValue ?? 0;
    const target = mission.targetValue;
    const percent = target > 0 ? Math.round((current / target) * 100) : 0;
    const safePercent = Math.max(0, Math.min(100, percent));
    const unit = mission.unit ? ` ${mission.unit}` : "";
    return {
      percent: safePercent,
      text: `${current.toLocaleString()} / ${target.toLocaleString()}${unit}`,
    };
  }, [mission]);

  const incrementButtons = useMemo(() => {
    if (!mission) return [];
    const unit = mission.unit ?? "";
    if (unit === "초") {
      return [
        { label: "+5초", amount: 5 },
        { label: "+10초", amount: 10 },
        { label: "+30초", amount: 30 },
      ];
    }
    if (unit === "m") {
      return [
        { label: "+50m", amount: 50 },
        { label: "+100m", amount: 100 },
      ];
    }
    if (unit === "장") {
      return [{ label: "+1장", amount: 1 }];
    }
    if (unit === "회") {
      return [{ label: "+1회", amount: 1 }];
    }
    return [{ label: "+1", amount: 1 }];
  }, [mission]);

  if (!mission) {
    return (
      <ScreenContainer scrollable={false} safeAreaBottom>
        <Header
          title="미션 상세"
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

        <YStack f={1} jc="center" ai="center" gap="$md" px="$md">
          <Text type="h3">미션을 찾을 수 없어요</Text>
          <Text type="body" colorVariant="secondary" ta="center">
            목록으로 돌아가서 다시 선택해주세요.
          </Text>
          <Button
            variant="primary"
            onPress={() => router.push("/(protected)/missions")}
          >
            미션 목록으로
          </Button>
        </YStack>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable safeAreaBottom>
      <Header
        title={mission.title}
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
            onPress={() => router.push("/(protected)/missions/in-progress")}
            icon={<MoreVertical size={20} color="$text1" />}
          />
        }
        borderBottom={false}
      />

      <YStack px="$md" pt="$sm" gap="$md">
        <Card
          bg="$background2"
          bw={1}
          boc="$color4"
          br="$xl"
          shop={0}
          p="$lg"
          gap="$sm"
        >
          <XStack gap="$xs" ai="center" flexWrap="wrap">
            <Chip
              size="sm"
              variantStyle="filled"
              themeColor={getStatusChipColor(mission.status)}
              text={getStatusLabel(mission.status)}
            />
            <Chip
              size="sm"
              variantStyle="outlined"
              themeColor="gray"
              text={getTypeLabel(mission.type)}
            />
            {mission.category ? (
              <Chip
                size="sm"
                variantStyle="outlined"
                themeColor="gray"
                text={mission.category}
              />
            ) : null}
          </XStack>

          <Text type="h3">{mission.title}</Text>
          <Text type="bodySmall" colorVariant="secondary">
            {mission.description}
          </Text>
        </Card>

        <Card
          bg="$background2"
          bw={1}
          boc="$color4"
          br="$xl"
          shop={0}
          p="$lg"
          gap="$sm"
        >
          <Text type="h4">진행도</Text>

          {mission.targetValue !== undefined ? (
            <YStack gap="$xs">
              <XStack jc="space-between" ai="center">
                <Text type="caption" colorVariant="secondary">
                  {progress.text}
                </Text>
                <Text type="caption" colorVariant="secondary">
                  {progress.percent}%
                </Text>
              </XStack>
              <Progress
                value={progress.percent}
                size="$3"
                bg="$color4"
                w="100%"
              >
                <Progress.Indicator
                  animation="medium"
                  backgroundColor="$accent1"
                />
              </Progress>
            </YStack>
          ) : (
            <Text type="caption" colorVariant="secondary">
              정량 목표가 없는 미션입니다.
            </Text>
          )}

          <XStack gap="$sm" flexWrap="wrap" mt="$xs">
            <Text type="caption" colorVariant="secondary">
              기간: {formatDate(mission.startDate)} ~{" "}
              {formatDate(mission.endDate)}
            </Text>
          </XStack>
        </Card>

        <Card
          bg="$background2"
          bw={1}
          boc="$color4"
          br="$xl"
          shop={0}
          p="$lg"
          gap="$sm"
        >
          <Text type="h4">보상</Text>

          <XStack gap="$xs" flexWrap="wrap">
            {mission.rewards?.map((r, idx) => {
              const label =
                r.type === "coin" ? `코인 +${r.amount}` : `경험치 +${r.amount}`;
              const color =
                r.type === "coin"
                  ? ("secondary" as const)
                  : ("tertiary" as const);
              return (
                <Chip
                  key={`${mission.id}-reward-${idx}`}
                  size="sm"
                  variantStyle="filled"
                  themeColor={color}
                  text={label}
                />
              );
            })}
          </XStack>
        </Card>

        <Card
          bg="$background2"
          bw={1}
          boc="$color4"
          br="$xl"
          shop={0}
          p="$lg"
          gap="$sm"
        >
          <Text type="h4">액션</Text>

          {mission.status === "pending" ? (
            <YStack gap="$sm">
              <Button
                variant="primary"
                onPress={() => handleStartMission(mission.id)}
              >
                시작하기
              </Button>
              <Button
                variant="outline"
                onPress={() => {
                  completeMission(mission.id);
                }}
              >
                완료 처리
              </Button>
            </YStack>
          ) : null}

          {mission.status === "in-progress" ? (
            <YStack gap="$sm">
              <XStack gap="$sm" flexWrap="wrap">
                {incrementButtons.map((b) => (
                  <Button
                    key={`${mission.id}-inc-${b.amount}`}
                    variant="secondary"
                    size="sm"
                    onPress={() => incrementProgress(mission.id, b.amount)}
                  >
                    {b.label}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => completeMission(mission.id)}
                >
                  완료 처리
                </Button>
              </XStack>

              <Text type="caption" colorVariant="secondary">
                팁: 아래 버튼으로 주행/업로드 진행도를 임의로 올려볼 수 있어요.
              </Text>
            </YStack>
          ) : null}

          {mission.status === "completed" ? (
            <YStack gap="$sm">
              <Text type="body" colorVariant="secondary">
                이미 완료한 미션입니다.
              </Text>
              <Button
                variant="ghost"
                onPress={() => router.push("/(protected)/missions/in-progress")}
              >
                진행중 미션 보러가기
              </Button>
            </YStack>
          ) : null}
        </Card>
      </YStack>
    </ScreenContainer>
  );
}
