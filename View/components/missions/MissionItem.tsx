// View/components/missions/MissionItem.tsx
import { ChevronRight } from "@tamagui/lucide-icons";
import { Avatar, Progress, XStack, YStack } from "tamagui";

import { Card } from "@/View/core/Card/Card";
import { Chip } from "@/View/core/Chip/Chip";
import { Text } from "@/View/core/Text/Text";
import type { Mission } from "@/domain/mission/types";

export type MissionItemProps = {
  mission: Mission;
  onPress?: (id: string) => void;
};

export const MissionItem = ({ mission, onPress }: MissionItemProps) => {
  const handlePress = () => {
    onPress?.(mission.id);
  };

  const firstChar = mission.title?.[0] ?? "?";

  const statusLabel =
    mission.status === "pending"
      ? "대기"
      : mission.status === "in-progress"
      ? "진행중"
      : mission.status === "completed"
      ? "완료"
      : "실패";

  const statusColor =
    mission.status === "completed"
      ? ("success" as const)
      : mission.status === "in-progress"
      ? ("primary" as const)
      : mission.status === "failed"
      ? ("error" as const)
      : ("gray" as const);

  const typeLabel = mission.type === "daily" ? "일일" : "주간";

  const accentBarColor =
    mission.status === "in-progress"
      ? ("$accent1" as const)
      : mission.status === "completed"
      ? ("$success" as const)
      : mission.status === "failed"
      ? ("$error" as const)
      : ("$color4" as const);

  const rewardChips = mission.rewards.map((r) => {
    const label =
      r.type === "coin" ? `코인 +${r.amount}` : `경험치 +${r.amount}`;
    const color =
      r.type === "coin" ? ("secondary" as const) : ("tertiary" as const);
    return { label, color };
  });

  const hasProgress = mission.targetValue !== undefined;
  const progressText = (() => {
    if (!hasProgress) return undefined;
    const current = mission.currentValue ?? 0;
    const target = mission.targetValue ?? 0;
    const unit = mission.unit ? ` ${mission.unit}` : "";
    return `${current.toLocaleString()} / ${target.toLocaleString()}${unit}`;
  })();

  const progressPercent = (() => {
    if (!hasProgress) return 0;
    const current = mission.currentValue ?? 0;
    const target = mission.targetValue ?? 0;
    if (target <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
  })();

  return (
    <Card
      // p="$xl"
      bg="$background2"
      br="$xxl"
      shop={0}
      onPress={handlePress}
      hoverStyle={{ backgroundColor: "$background3" }}
      pressStyle={{ backgroundColor: "$background3", opacity: 0.92 }}
    >
      <XStack ai="stretch" gap="$md">
        {/* 좌측 네온 포인트 (스크린샷 느낌) */}
        {/* <YStack
          width={4}
          borderRadius="$circular"
          backgroundColor={accentBarColor}
          opacity={mission.status === "pending" ? 0.6 : 1}
        /> */}

        <XStack ai="center" space="$md" flex={1} padding={"$xs"}>
          <YStack flex={1} space="$xs" mt={"$xs"}>
            <XStack jc="space-between" ai="center" gap="$sm">
              <Text type="h4" fontWeight="$medium" numberOfLines={1} flex={1}>
                {mission.title}
              </Text>
              <ChevronRight size={18} color="$text2" />
            </XStack>

            {mission.description ? (
              <Text
                type="caption"
                color={"$color6"}
                numberOfLines={2}
                mb={"$xxs"}
              >
                {mission.description}
              </Text>
            ) : null}

            <XStack gap="$xs" flexWrap="wrap" ai="center" mt="$sm" mb="$xs">
              <Chip size="sm" themeColor={statusColor} text={statusLabel} />
              <Chip
                size="sm"
                variantStyle="outlined"
                themeColor="gray"
                text={typeLabel}
              />
              {mission.category ? (
                <Chip
                  size="sm"
                  variantStyle="outlined"
                  themeColor="gray"
                  text={mission.category}
                />
              ) : null}
              {rewardChips.map((c) => (
                <Chip
                  key={`${mission.id}-${c.label}`}
                  size="sm"
                  themeColor={"info"}
                  text={c.label}
                />
              ))}
            </XStack>

            {hasProgress && mission.status !== "completed" ? (
              <YStack my="$xs" gap="$xs">
                <XStack jc="space-between">
                  <Text type="caption" colorVariant="secondary">
                    {progressText}
                  </Text>
                  <Text type="caption" colorVariant="secondary">
                    {progressPercent}%
                  </Text>
                </XStack>
                <Progress
                  value={progressPercent}
                  size="$2"
                  bg="$color4"
                  w="100%"
                >
                  <Progress.Indicator
                    animation="medium"
                    backgroundColor="$accent1"
                  />
                </Progress>
              </YStack>
            ) : null}
          </YStack>
        </XStack>
      </XStack>
    </Card>
  );
};
