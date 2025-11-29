import { Avatar, XStack, YStack } from "tamagui";

import { Card } from "@/View/core/Card/Card";
import { Text } from "@/View/core/Text/Text";
import type { MissionPreview } from "@/domain/mission/types";

export type MissionPreviewItemProps = {
  mission: MissionPreview;
  onPress?: (missionId: string) => void;
};

export const MissionPreviewItem = ({
  mission,
  onPress,
}: MissionPreviewItemProps) => {
  const handlePress = () => {
    if (onPress) {
      onPress(mission.id);
    }
  };

  return (
    <Card
      py={"$md"}
      px={0}
      hoverStyle={{ backgroundColor: "$background3" }}
      pressStyle={{ backgroundColor: "$background3", opacity: 0.8 }}
      onPress={handlePress}
      borderWidth={0}
      backgroundColor="$background1"
      shop={0}
    >
      <XStack space="$md" ai="center">
        <Avatar circular size="$4" bg={"$accent5"}>
          {mission.iconUrl ? (
            <Avatar.Image
              accessibilityLabel={mission.title}
              src={mission.iconUrl}
            />
          ) : (
            <Avatar.Fallback>
              {/* ✅ 문자열을 Text로 감싸기 */}
              <Text type="bodySmall" fontWeight="$semibold">
                {mission.title.charAt(0) || "M"}
              </Text>
            </Avatar.Fallback>
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
