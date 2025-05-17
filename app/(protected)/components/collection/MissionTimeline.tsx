import { Text, View } from "react-native";
// import TimelineEventItem from './TimelineEventItem';

/**
 * 해당 애완동물과 함께했던 미션 기록을 시간 순서대로 표시하는 타임라인 컴포넌트입니다.
 */
// type MissionTimelineProps = {
//   petId: string;
//   // missionRecords: MissionRecord[]; // TODO: MissionRecord 타입 정의 (데이터 fetch 후 사용)
// };

export default function MissionTimeline() {
/*{ petId, missionRecords }: MissionTimelineProps*/
  return (
    <View>
      <Text>MissionTimeline Component for Pet ID: {/*petId*/}</Text>
      {/* <FlatList
        data={missionRecords}
        renderItem={({ item }) => <TimelineEventItem record={item} />}
        keyExtractor={(item) => item.recordId.toString()}
      /> */}
    </View>
  );
}
