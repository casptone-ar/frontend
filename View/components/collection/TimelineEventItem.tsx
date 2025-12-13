import type { TimelineEvent } from "@/domain/collection/types";
import {
  Award,
  CalendarCheck,
  CheckCircle,
  ChevronsUp,
  Star,
} from "@tamagui/lucide-icons"; // 아이콘 예시
import { Paragraph, Text, XStack, YStack } from "tamagui";

type TimelineEventItemProps = {
  event: TimelineEvent;
  isLastItem?: boolean; // 마지막 아이템인지 여부 (예: 연결선 스타일링용)
};

/**
 * 미션 타임라인의 개별 이벤트를 표시하는 컴포넌트입니다.
 * 이벤트 종류에 따라 아이콘, 제목, 설명 등을 다르게 표시할 수 있습니다.
 *
 * @param {TimelineEventItemProps} props - 컴포넌트 props
 * @returns {JSX.Element}
 */
export const TimelineEventItem = ({
  event,
  isLastItem = false,
}: TimelineEventItemProps) => {
  const eventDate = new Date(event.timestamp).toLocaleDateString();
  const eventTime = new Date(event.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getIconForType = () => {
    switch (event.type) {
      case "mission_completed":
        return <CheckCircle size={20} color="$green10" />;
      case "level_up":
        return <ChevronsUp size={20} color="$blue10" />;
      case "item_acquired":
        return <Star size={20} color="$yellow10" />;
      case "ascension":
        return <Award size={20} color="$purple10" />;
      default:
        return <CalendarCheck size={20} color="$color10" />;
    }
  };

  return (
    <XStack space="$3">
      {/* 아이콘 및 타임라인 라인 부분 */}
      <YStack ai="center" space="$1">
        <YStack
          p="$1.5" // 아이콘 주변 패딩
          borderRadius={100} // 원형 배경
          backgroundColor={
            event.type === "ascension" ? "$purple5" : "$backgroundHover"
          } // 타입에 따른 강조
        >
          {getIconForType()}
        </YStack>
        {!isLastItem && ( // 마지막 아이템이 아니면 세로선 표시
          <YStack f={1} width={2} backgroundColor="$borderColor" />
        )}
      </YStack>

      {/* 이벤트 내용 부분 */}
      <YStack
        f={1}
        pb={isLastItem ? "$0" : "$3" /* 마지막 아이템 아니면 아래 간격 */}
      >
        <Paragraph fontWeight="bold" size="$4">
          {event.title}
        </Paragraph>
        <Text fos="$2" color="$color10">
          {eventDate} {eventTime}
        </Text>
        {event.description && (
          <Paragraph size="$3" color="$color11" mt="$1">
            {event.description}
          </Paragraph>
        )}
        {event.details?.rewardCoin && (
          <Text fos="$2" color="$yellow11" mt="$0.5">
            + {event.details.rewardCoin} 코인 획득
          </Text>
        )}
        {event.details?.achievedLevel && (
          <Text fos="$2" color="$blue11" mt="$0.5">
            레벨 {event.details.achievedLevel} 달성!
          </Text>
        )}
      </YStack>
    </XStack>
  );
};
