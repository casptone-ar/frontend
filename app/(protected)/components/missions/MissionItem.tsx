import { Button } from "@/View/core/Button/Button";
import { Card } from "@/View/core/Card/Card";
import { Text } from "@/View/core/Text/Text";
import type { BaseMission, MissionReward } from "@/domain/mission/types";
import { CheckCircle, RefreshCw, Zap } from "@tamagui/lucide-icons"; // 예시 아이콘
import { Avatar, Paragraph, Progress, XStack, YStack } from "tamagui"; // Tamagui 컴포넌트

export type MissionItemProps = {
  mission: BaseMission;
  /** 미션 아이템 클릭 또는 주요 액션 버튼 클릭 시 호출됩니다. */
  onPress?: (missionId: string, action?: "claim" | "details") => void;
  /** 현재 사용자의 코인 (보상 받기 버튼 활성화 로직 등에 사용될 수 있음 - 여기서는 직접 사용 안함) */
  // userCoins?: number;
};

/**
 * @description 미션 목록에 표시될 개별 미션 아이템입니다.
 * 미션의 제목, 진행도, 보상, 상태 등을 표시합니다.
 */
export const MissionItem = ({ mission, onPress }: MissionItemProps) => {
  const {
    id,
    title,
    description,
    status,
    rewards,
    currentValue = 0,
    targetValue = 1, // 0으로 나누는 것을 방지하기 위해 기본값 1
    iconUrl,
    type,
  } = mission;

  const progressPercentage = 50;

  const handlePress = (actionType: "claim" | "details" = "details") => {
    if (onPress) {
      onPress(id, actionType);
    }
  };

  const renderRewards = (rewardsToShow: MissionReward[]) => (
    <XStack gap="$xs" ai="center" flexWrap="wrap">
      {rewardsToShow.map((reward, index) => (
        <XStack
          key={reward.type}
          gap="$xxs"
          ai="center"
          br="$lg"
          bg="$background3"
          px="$sm"
          py="$xxs"
        >
          {/* 간단한 아이콘 또는 텍스트로 보상 타입 표시 */}
          {reward.type === "coin" && (
            <Text type="caption" color="$accent1">
              💰
            </Text>
          )}
          {reward.type === "experience" && (
            <Text type="caption" color="$accent1">
              ⭐
            </Text>
          )}
          <Text type="caption" fontWeight="$medium" color="$color11">
            {reward.amount}
          </Text>
        </XStack>
      ))}
    </XStack>
  );

  const canClaimReward =
    status === "completed" &&
    !mission.rewards.every((r) => r.type === "experience"); // 예시: 경험치 외 보상이 있고, 완료된 상태

  // 아이콘 설정 (임시)
  let MissionIconComponent = Zap;
  if (type === "daily") MissionIconComponent = RefreshCw;
  if (status === "completed") MissionIconComponent = CheckCircle;

  return (
    <Card
      onPress={() => handlePress("details")}
      hoverStyle={{ bg: "$backgroundFocus" }}
      pressStyle={{ bg: "$backgroundPress" }}
      gap="$md"
      p="$lg" // Card 내부 패딩 증가
    >
      <XStack gap="$md" ai="center">
        <Avatar
          circular
          size="$5"
          bg={status === "completed" ? "$accent1" : "$accent2"}
        >
          {iconUrl ? (
            <Avatar.Image src={iconUrl} />
          ) : (
            <MissionIconComponent
              size="$2.5"
              color={status === "completed" ? "$accentPositive1" : "$accent1"}
            />
          )}
        </Avatar>

        <YStack flex={1} gap="$xs">
          <Text type="h4" fontWeight="$bold" numberOfLines={2}>
            {title}
          </Text>
          {description && (
            <Paragraph size="$3" numberOfLines={2} color="$color10">
              {description}
            </Paragraph>
          )}

          {/* 진행도 표시 (pending 상태가 아니거나, targetValue가 있을 때) */}
          {status !== "pending" &&
            typeof targetValue === "number" &&
            targetValue > 0 && (
              <YStack gap="$xxs">
                <Progress
                  value={progressPercentage}
                  size="$1"
                  bg="$background3"
                >
                  <Progress.Indicator animation="medium" bg={"$accent1"} />
                </Progress>
                <Text type="caption" colorVariant="secondary" ta="right">
                  {currentValue} / {targetValue}
                </Text>
              </YStack>
            )}
        </YStack>
      </XStack>

      <XStack jc="space-between" ai="center" mt="$sm">
        {renderRewards(rewards)}
        {/* 상태에 따른 버튼 또는 텍스트 표시 */}
        {status === "pending" && (
          <Button
            variant="outline"
            size="sm"
            onPress={() => handlePress("details")}
          >
            시작하기
          </Button>
        )}
        {status === "in-progress" && (
          <Text
            type="body"
            colorVariant="accent"
            onPress={() => handlePress("details")}
          >
            진행중
          </Text>
        )}
        {canClaimReward && ( // 'completed' 상태 중 보상 수령 가능할 때
          <Button
            variant="primary"
            size="sm"
            iconAfter={Zap}
            onPress={() => handlePress("claim")}
          >
            보상 받기
          </Button>
        )}
        {status === "completed" &&
          !canClaimReward && ( // 'completed' 이지만 이미 보상을 다 받았거나 경험치 보상만 남은 경우
            <XStack
              ai="center"
              gap="$xs"
              p="$xs"
              br="$xl"
              bg="$accentPositive2"
            >
              <CheckCircle size={16} color="$accentPositive1" />
              <Text type="body" color="$accentPositive1" fontWeight="$semibold">
                완료됨
              </Text>
            </XStack>
          )}
        {status === "failed" && (
          <Text type="body" colorVariant="error">
            실패
          </Text>
        )}
      </XStack>
    </Card>
  );
};
