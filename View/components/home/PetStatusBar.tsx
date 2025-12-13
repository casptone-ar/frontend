import { Progress, XStack, YStack } from "tamagui";

import { Text } from "@/View/core/Text/Text";
import type { PetStats } from "@/domain/pet/types";

export type PetStatusBarProps = {
  name: string;
  stats: PetStats; // 전체 PetStats 사용
  experienceToNextLevel: number;
  isLoading?: boolean;
};

/**
 * @description 애완동물의 현재 상태(이름, 레벨, 경험치, 건강, 행복도)를 표시하는 컴포넌트입니다.
 * @param {PetStatusBarProps} props - 애완동물 상태 정보
 * @returns {JSX.Element} 애완동물 상태 바 컴포넌트
 */
export const PetStatusBar = ({
  name,
  stats,
  experienceToNextLevel,
  isLoading,
}: PetStatusBarProps): JSX.Element => {
  if (isLoading) {
    return (
      <YStack // isLoading 시에도 전체적인 YStack 구조 유지
        space="$md"
        p="$md"
        borderRadius="$xxl"
        backgroundColor="$background2"
        borderWidth={1}
        borderColor="$border1"
        borderCurve="continuous"
      >
        <Text type="h2" fontWeight="$bold" textAlign="center" mb="$sm">
          ...
        </Text>
        <XStack jc="space-around" ai="flex-start" space="$lg">
          {["레벨", "경험치", "건강", "행복도"].map((label) => (
            <YStack key={label} ai="center" space="$xs" flex={1}>
              <Text type="body" colorVariant="secondary">
                {label}
              </Text>
              <Text type="h3" fontWeight="$bold">
                ...
              </Text>
            </YStack>
          ))}
        </XStack>
      </YStack>
    );
  }

  const experiencePercentage =
    experienceToNextLevel > 0
      ? (stats.experience / experienceToNextLevel) * 100
      : 0;

  return (
    <YStack gap="$md" py="$xl">
      <XStack
        flexWrap="wrap"
        jc="space-between"
        ai="flex-start"
        bg={"$color1"}
        p={"$md"}
        borderRadius={"$xxl"}
        borderCurve="continuous"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={4}
      >
        <YStack ai="center" gap="$xxs" flexBasis="33%" mb="$md">
          <Text type="bodyLarge" fos={24} fontWeight="$semibold">
            {stats.level}
          </Text>
          <Text type="bodySmall" colorVariant="tertiary">
            레벨
          </Text>
        </YStack>

        <YStack ai="center" gap="$xxs" flexBasis="33%" mb="$md">
          <Text type="bodyLarge" fos={24} fontWeight="$semibold">
            {stats.health}
            {/* TODO: 아이콘이나 간단한 바로 표시 고려 (예: Heart icon) */}
          </Text>
          <Text type="bodySmall" colorVariant="tertiary">
            건강
          </Text>
          {/* 건강은 수치 또는 아이콘/바로 표현 가능 */}
        </YStack>

        <YStack ai="center" gap="$xxs" flexBasis="33%" mb="$md">
          <Text type="bodyLarge" fos={24} fontWeight="$semibold">
            {stats.happiness}
            {/* TODO: 아이콘이나 간단한 바로 표시 고려 (예: Smile icon) */}
          </Text>
          <Text type="bodySmall" colorVariant="tertiary">
            행복도
          </Text>
          {/* 행복도도 수치 또는 아이콘/바로 표현 가능 */}
        </YStack>

        <YStack ai="center" gap="$xxs" flexBasis="100%" miw={120} pt={"$sm"}>
          <Progress
            value={experiencePercentage}
            size="$3"
            w="100%"
            backgroundColor="$color5"
          >
            <Progress.Indicator animation="medium" backgroundColor="$color11" />
          </Progress>
          <Text type="caption" colorVariant="tertiary" fontWeight="$medium">
            {stats.experience} / {experienceToNextLevel} EXP
          </Text>
        </YStack>
      </XStack>
    </YStack>
  );
};
