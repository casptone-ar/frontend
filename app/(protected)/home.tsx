// app/(protected)/home.tsx
import { useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { ListChecks, MapPin, Navigation } from "@tamagui/lucide-icons";
import { Button as TamaguiButton, XStack, YStack } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "@/View/core/Card/Card";
import { Header } from "@/View/core/Header/Header";
import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { Text } from "@/View/core/Text/Text";
import { MissionItem } from "@/View/components/missions/MissionItem";
import { useMissionStore } from "@/View/store/missionStore";

const MAP_INITIAL_REGION: Region = {
  latitude: 37.634863,
  longitude: 126.832149,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function HomeScreen() {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();

  const { spots, getSpotById, getMissionsBySpotId } = useMissionStore();

  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [sheetIndex, setSheetIndex] = useState<number>(-1);

  const snapPoints = useMemo(() => ["44%", "62%"], []);

  const selectedSpot = useMemo(() => {
    if (!selectedSpotId) return undefined;
    return getSpotById(selectedSpotId);
  }, [getSpotById, selectedSpotId]);

  const spotMissions = useMemo(() => {
    if (!selectedSpotId) return [];
    return getMissionsBySpotId(selectedSpotId);
  }, [getMissionsBySpotId, selectedSpotId]);

  const openSpotSheet = (spotId: string) => {
    setSelectedSpotId(spotId);
    setSheetIndex(0);
    requestAnimationFrame(() => bottomSheetRef.current?.snapToIndex(0));
  };

  const closeSpotSheet = () => {
    setSheetIndex(-1);
    requestAnimationFrame(() => bottomSheetRef.current?.close());
  };

  const handleNavigateToMissions = () => {
    closeSpotSheet();
    router.push("/(protected)/missions");
  };

  const handleSelectMission = (missionId: string) => {
    closeSpotSheet();
    router.push(`/(protected)/missions/${missionId}`);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScreenContainer
        scrollable={false}
        safeAreaTop={false}
        safeAreaBottom={false}
      >
        {/* ✅ 지도는 화면 전체(네비게이션 바 영역 제외된 컨텐츠 영역)를 꽉 채우도록 배경으로 깔기 */}
        <MapView
          userInterfaceStyle="dark"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          initialRegion={MAP_INITIAL_REGION}
          mapType={Platform.OS === "ios" ? "mutedStandard" : "standard"}
          showsCompass={false}
          toolbarEnabled={false}
        >
          {spots.map((spot) => (
            <Marker
              key={spot.id}
              coordinate={{
                latitude: spot.latitude,
                longitude: spot.longitude,
              }}
              title={spot.title}
              description={spot.subtitle}
              pinColor={"#111111"}
              onPress={() => openSpotSheet(spot.id)}
            />
          ))}
        </MapView>

        {/* ✅ 상단 UI 오버레이 (absolute top) */}
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          paddingTop={insets.top}
          px="$md"
          gap="$sm"
        >
          <Card
            bg="$background2"
            borderCurve="continuous"
            br="$xxl"
            boxShadow={"0px 0px 24px 0px rgba(0, 0, 0, 0.3)"}
            p="$md"
            gap="$sm"
            opacity={0.95}
          >
            <XStack jc="space-between" ai="center">
              <XStack ai="center" gap="$sm">
                <YStack
                  width={36}
                  height={36}
                  borderRadius="$circular"
                  bg="$background3"
                  ai="center"
                  jc="center"
                >
                  <MapPin size={18} color="$accent1" />
                </YStack>
                <YStack>
                  <Text type="body" fontWeight="$semibold">
                    화정역 주변 스팟
                  </Text>
                  <Text type="caption" colorVariant="secondary">
                    마커를 눌러 스팟 미션을 확인하세요 (Mock)
                  </Text>
                </YStack>
              </XStack>

              <YStack
                width={36}
                height={36}
                borderRadius="$circular"
                bg="$background3"
                ai="center"
                jc="center"
              >
                <Navigation size={18} color="$accent1" />
              </YStack>
            </XStack>
          </Card>

          <Header
            transparent
            title="탐험 지도"
            leftAction={null}
            rightAction={
              <TamaguiButton
                chromeless
                circular
                size="$6"
                backgroundColor="$background3"
                borderRadius="$circular"
                boxShadow={"0px 0px 6px 0px rgba(0, 0, 0, 0.7)"}
                pressStyle={{ backgroundColor: "$color4", opacity: 0.9 }}
                onPress={handleNavigateToMissions}
                icon={<ListChecks size={20} color="$text1" />}
              />
            }
            borderBottom={false}
            px={0}
            py="$sm"
          />
        </YStack>

        <BottomSheet
          ref={bottomSheetRef}
          index={sheetIndex}
          snapPoints={snapPoints}
          enablePanDownToClose
          onChange={(idx) => setSheetIndex(idx)}
          backgroundStyle={{
            backgroundColor: "#0d1115",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
          }}
          handleIndicatorStyle={{ backgroundColor: "#202428" }}
          backdropComponent={(props) => (
            <BottomSheetBackdrop
              {...props}
              disappearsOnIndex={-1}
              appearsOnIndex={0}
              opacity={0.35}
            />
          )}
        >
          <YStack pb="$md" gap="$sm" flex={1}>
            <XStack jc="space-between" ai="center" p="$lg">
              <YStack>
                <Text type="h3">{selectedSpot?.title ?? "스팟"}</Text>
                <Text type="caption" colorVariant="secondary" mt="$xs">
                  {selectedSpot?.subtitle ?? "해당 스팟의 미션을 확인하세요."}
                </Text>
              </YStack>
              <TamaguiButton
                chromeless
                size="$3"
                backgroundColor="$background3"
                borderRadius="$circular"
                pressStyle={{ backgroundColor: "$color4", opacity: 0.9 }}
                onPress={handleNavigateToMissions}
              >
                <Text type="caption" color="$accent1" fontWeight="$semibold">
                  전체 미션
                </Text>
              </TamaguiButton>
            </XStack>

            <BottomSheetFlatList
              data={spotMissions}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingTop: 44,
                paddingBottom: 144,
                paddingHorizontal: 16,

                backgroundColor: "#000000",
              }}
              ItemSeparatorComponent={() => <YStack h="$xxl" />}
              renderItem={({ item }) => (
                <MissionItem mission={item} onPress={handleSelectMission} />
              )}
              ListEmptyComponent={
                <Card
                  bg="$background2"
                  bw={1}
                  boc="$color4"
                  br="$xxl"
                  shop={0}
                  p="$md"
                  gap="$sm"
                  ai="center"
                >
                  <Text type="body" colorVariant="secondary">
                    이 스팟에는 아직 미션이 없어요.
                  </Text>
                </Card>
              }
            />
          </YStack>
        </BottomSheet>
      </ScreenContainer>
    </GestureHandlerRootView>
  );
}
