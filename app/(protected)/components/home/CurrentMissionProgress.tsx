import { Card } from "@/View/core/Card/Card";
import { Text } from "@/View/core/Text/Text";
import type { DailyStepMissionProgress } from "@/domain/pet/types";
import { Progress, Spinner, XStack, YStack } from "tamagui";

/**
 * @typedef CurrentMissionProgressProps
 * @property {DailyStepMissionProgress | null} missionProgress - 현재 진행 중인 주요 미션(예: 오늘의 걸음 수 목표)의 진행도 정보입니다.
 * @property {boolean} [isLoading] - 미션 진행 정보를 로딩 중인지 여부입니다.
 * @property {() => void} [onPress] - 컴포넌트 클릭 시 실행될 콜백 함수입니다 (예: 미션 상세 화면으로 이동).
 */

type CurrentMissionProgressProps = {
  missionProgress: DailyStepMissionProgress | null;
  isLoading?: boolean;
  onPress?: () => void;
};

/**
 * 현재 진행 중인 주요 미션(예: 오늘의 걸음 수 목표)의 진행도를 표시하는 컴포넌트입니다.
 *
 * @param {CurrentMissionProgressProps} props - 컴포넌트 props
 * @returns {JSX.Element}
 *
 * @example
 * const missionProgress = { currentSteps: 3000, goalSteps: 5000, rewardCoin: 10, isCompletedToday: false };
 * <CurrentMissionProgress missionProgress={missionProgress} isLoading={false} />
 */
export const CurrentMissionProgress = ({
  missionProgress,
  isLoading,
  onPress,
}: CurrentMissionProgressProps) => {
  if (isLoading) {
    return (
      <Card p="$lg" ai="center" jc="center" mih={120}>
        <XStack ai="center" space="$md">
          <Spinner size="large" color="$accent1" />
          <Text type="body" colorVariant="secondary">
            미션 정보 로딩 중...
          </Text>
        </XStack>
      </Card>
    );
  }

  if (!missionProgress) {
    return (
      <Card p="$lg" ai="center" jc="center" mih={120}>
        <Text type="body" colorVariant="secondary">
          진행 중인 주요 미션 정보가 없습니다.
        </Text>
      </Card>
    );
  }

  const progressPercentage = 50;

  return (
    <Card
      onPress={onPress}
      hoverStyle={onPress ? { opacity: 0.9, bg: "$background2" } : {}}
      pressStyle={onPress ? { opacity: 0.8, bg: "$background3" } : {}}
      gap="$md"
      p="$md"
      shop={0}
      bg={"$background3"}
    >
      <XStack jc="space-between" ai="center">
        <Text type="h4">오늘의 걸음 수 목표</Text>
      </XStack>

      {missionProgress.isCompletedToday ? (
        <YStack gap="$sm" ai="center">
          <Text type="body" color="$accent1" fontWeight="$bold">
            🎉 오늘 목표 달성! 🎉
          </Text>
          <Text type="caption" colorVariant="secondary">
            보상: {missionProgress.rewardCoin} 코인 획득!
          </Text>
        </YStack>
      ) : (
        <YStack gap="$md">
          <YStack gap="$xs">
            <XStack jc="space-between">
              <Text type="body" fontWeight="$semibold">
                진행도
              </Text>
              <Text type="body" colorVariant="secondary">
                {missionProgress.currentSteps} / {missionProgress.goalSteps}{" "}
                걸음
              </Text>
            </XStack>
            <Progress
              value={progressPercentage}
              size="$3"
              bg="$background3"
              w="100%"
            >
              <Progress.Indicator
                animation="medium"
                backgroundColor="$accent1"
              />
            </Progress>
          </YStack>
          <Text type="caption" colorVariant="tertiary" ta="right">
            달성 시 +{missionProgress.rewardCoin} 코인
          </Text>
        </YStack>
      )}
    </Card>
  );
};
