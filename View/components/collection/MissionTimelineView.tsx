import type { MissionTimeline } from "@/domain/collection/types";
import { Paragraph, YStack } from "tamagui";
import { TimelineEventItem } from "./TimelineEventItem";

type MissionTimelineViewProps = {
  timeline: MissionTimeline;
};

/**
 * 특정 애완동물의 미션 타임라인을 시각적으로 표시하는 컴포넌트입니다.
 * 시간 순서대로 정렬된 이벤트 목록을 보여줍니다.
 *
 * @param {MissionTimelineViewProps} props - 컴포넌트 props
 * @returns {JSX.Element}
 */
export const MissionTimelineView = ({ timeline }: MissionTimelineViewProps) => {
  if (!timeline.events || timeline.events.length === 0) {
    return <Paragraph>기록된 타임라인 이벤트가 없습니다.</Paragraph>;
  }

  // 이벤트들을 시간 역순으로 (최신이 위로) 표시하려면 정렬
  const sortedEvents = [...timeline.events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <YStack space="$3">
      {/* 많은 이벤트가 있을 경우 FlatList 또는 SectionList 고려 */}
      {sortedEvents.map((event, index) => (
        <TimelineEventItem
          key={event.id}
          event={event}
          isLastItem={index === sortedEvents.length - 1}
        />
      ))}
    </YStack>
  );
};
