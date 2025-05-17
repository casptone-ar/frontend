import { Avatar, XStack, YStack } from "tamagui";

import { Card } from "@/View/core/Card/Card"; // Card 코어 컴포넌트 사용 가능
import { Text } from "@/View/core/Text/Text";
import type { MissionPreview } from "@/domain/mission/types"; // 위에서 정의한 타입

export type MissionPreviewItemProps = {
  mission: MissionPreview;
  onPress?: (missionId: string) => void;
};

/**
 * @description 홈 화면에 표시될 개별 미션 미리보기 아이템입니다.
 */
export const MissionPreviewItem = ({
  mission,
  onPress,
}: MissionPreviewItemProps) => {
  const handlePress = () => {
    if (onPress) {
      onPress(mission.id);
    }
  };

  // 이미지의 겹쳐진 아바타는 여기서는 단일 아바타로 표현
  return (
    <Card
      py={"$md"}
      px={0}
      hoverStyle={{ backgroundColor: "$background3" }}
      pressStyle={{ backgroundColor: "$background3", opacity: 0.8 }}
      onPress={handlePress}
      // animation="lazy" // Tamagui 애니메이션 적용 가능
      borderWidth={0} // 기본 테두리 없음
      backgroundColor="$background1" // Card 자체 배경 투명하게 하여 YStack에서 제어
      shop={0}
    >
      <XStack space="$md" ai="center">
        <Avatar circular size="$4" bg={"$accent5"}>
          {/* TODO: mission.iconUrl이 있으면 Avatar.Image 사용, 없으면 기본 아이콘/글자 */}
          {mission.iconUrl ? (
            <Avatar.Image
              accessibilityLabel={mission.title}
              src={mission.iconUrl}
            />
          ) : (
            // 예시: 미션 카테고리 첫 글자
            <Avatar.Fallback>A</Avatar.Fallback>
          )}
        </Avatar>
        <YStack flex={1} gap={"$xxs"}>
          <Text type="body" fontWeight="$semibold" numberOfLines={2}>
            {mission.title}
          </Text>
          <Text type="caption" colorVariant="tertiary">
            {mission.statusText}
          </Text>
        </YStack>
      </XStack>
    </Card>
  );
};
