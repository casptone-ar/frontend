// View/components/ar/ARView.tsx

import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Paragraph, YStack } from "tamagui";
import type { PetAnimationType } from "@/domain/pet/types";

type ARViewProps = {
  petModelUrl: string;
  currentAnimation: PetAnimationType;
  scale?: number; // 🔹 선택적
  onPetAnchorFound?: () => void;
  onPetPlaced?: () => void;
  onPetTapped?: () => void;
  onError?: (error: Error) => void;
};

type Pos = { x: number; y: number };

const PET_SIZE = 160; // 펫 스프라이트 크기(px)

export const ARView = ({
  petModelUrl,
  currentAnimation,
  scale = 1,
  onPetAnchorFound,
  onPetPlaced,
  onPetTapped,
}: ARViewProps) => {
  // 🔹 1. 모든 Hook은 여기 위쪽에 몰아놓기
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<"front" | "back">("back");

  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const [petPos, setPetPos] = useState<Pos | null>(null);

  // 🔹 2. 권한 여부와 상관없이 항상 호출되는 useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      onPetAnchorFound?.();
      onPetPlaced?.();
    }, 800);
    return () => clearTimeout(timer);
  }, [onPetAnchorFound, onPetPlaced]);

  // 🔹 레이아웃 사이즈 저장
  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ width, height });

    // 처음 한 번은 화면 아래쪽 가운데에 펫 위치시킴
    if (!petPos && width > 0 && height > 0) {
      setPetPos({
        x: width / 2,
        y: height * 0.6,
      });
    }
  };

  // 🔹 화면 탭 → 펫 위치 옮기고, onPetTapped 호출
  const handlePress = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    setPetPos({ x: locationX, y: locationY });
    onPetTapped?.();
  };

  // 🔹 권한 로딩 중
  if (!permission) {
    return (
      <YStack f={1} jc="center" ai="center">
        <Paragraph>카메라 권한 상태를 확인하는 중...</Paragraph>
      </YStack>
    );
  }

  // 🔹 권한 아직 없음
  if (!permission.granted) {
    return (
      <YStack f={1} jc="center" ai="center" p="$4" space="$3">
        <Paragraph>카메라 권한이 필요합니다.</Paragraph>
        <Paragraph color="$color10">
          계속하려면 카메라 접근을 허용해 주세요.
        </Paragraph>
        <Pressable
          onPress={requestPermission}
          style={{
            marginTop: 16,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: "black",
          }}
        >
          <Paragraph color="white">권한 요청하기</Paragraph>
        </Pressable>
      </YStack>
    );
  }

  // 🔹 펫 위치 계산 (값 없으면 중앙 근처에 기본값)
  const effectivePos: Pos | null =
    petPos && containerSize.width && containerSize.height
      ? petPos
      : containerSize.width && containerSize.height
      ? { x: containerSize.width / 2, y: containerSize.height * 0.6 }
      : null;

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      onLayout={handleLayout}
    >
      {/* 🔹 실제 카메라 프리뷰 */}
      <CameraView style={styles.camera} facing={facing} />

      {/* 🔹 카메라 위 펫 이미지 (투명 PNG 사용 가능) */}
      {effectivePos && (
        <Image
          // TODO: 이 부분을 나중에 네 프로젝트 에셋 경로로 교체하면 됨
          // 예: source={require("@/assets/pets/dog_idle.png")}
          source={{
            uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Golde33443.jpg/320px-Golde33443.jpg",
          }}
          style={{
            position: "absolute",
            width: PET_SIZE * scale,
            height: PET_SIZE * scale,
            left: effectivePos.x - (PET_SIZE * scale) / 2,
            top: effectivePos.y - (PET_SIZE * scale) / 2,
          }}
          resizeMode="contain"
        />
      )}

      {/* 🔹 카메라 위 오버레이 mock UI */}
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        p="$4"
        ai="center"
        bg="rgba(0,0,0,0.35)"
      >
        <Paragraph color="white">모델: {petModelUrl}</Paragraph>
        <Paragraph color="white">애니메이션: {currentAnimation}</Paragraph>
        <Paragraph color="white">스케일: {scale}</Paragraph>
        <Paragraph mt="$2" color="white">
          화면을 탭하면 펫이 해당 위치로 이동하고 반응합니다 (mock)
        </Paragraph>
      </YStack>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
});
