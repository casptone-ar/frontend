import { Stack } from "expo-router";

/**
 * 컬렉션 (동물농장) 관련 화면들의 네비게이션 스택 레이아웃입니다.
 * - 컬렉션 메인 화면 (승천한 펫 목록)
 * - 컬렉션 상세 화면 (특정 펫의 3D 모델 및 미션 타임라인)
 */
export default function CollectionLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "동물농장" }} />
      <Stack.Screen name="[petId]" options={{ title: "펫 상세 정보" }} />
    </Stack>
  );
}
