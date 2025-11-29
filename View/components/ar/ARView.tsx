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
import { PET_SPRITE_ASSETS, type PetSpriteKey } from "@/domain/pet/assets";

type ARViewProps = {
  petModelUrl: string;
  currentAnimation: PetAnimationType;
  scale?: number;
  onPetAnchorFound?: () => void;
  onPetPlaced?: () => void;
  onPetTapped?: () => void;

  /** 어떤 스프라이트를 쓸지 선택 (없으면 기본 cat) */
  spriteKey?: PetSpriteKey;
};

type Pos = { x: number; y: number };

const PET_SIZE = 260;

export const ARView = ({
  petModelUrl,
  currentAnimation,
  scale = 1,
  onPetAnchorFound,
  onPetPlaced,
  onPetTapped,
  spriteKey = "cat",
}: ARViewProps) => {
  // 🔹 모든 Hook은 위에서 한 번씩, 어떤 경우에도 항상 호출되게
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<"front" | "back">("back");
  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
  });
  const [petPos, setPetPos] = useState<Pos | null>(null);

  // 🔹 권한 허용된 상태에서만 앵커/배치 이벤트 한 번 쏘기
  useEffect(() => {
    if (!permission?.granted) return;

    const timer = setTimeout(() => {
      onPetAnchorFound?.();
      onPetPlaced?.();
    }, 800);

    return () => clearTimeout(timer);
  }, [permission?.granted, onPetAnchorFound, onPetPlaced]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ width, height });

    if (!petPos && width > 0 && height > 0) {
      setPetPos({
        x: width / 2,
        y: height * 0.6,
      });
    }
  };

  const handlePress = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    setPetPos({ x: locationX, y: locationY });
    onPetTapped?.();
  };

  // 🔹 여기부터는 Hook 없음 (return 해도 OK)

  // 권한 로딩 중
  if (!permission) {
    return (
      <YStack f={1} jc="center" ai="center">
        <Paragraph>카메라 권한 상태를 확인하는 중...</Paragraph>
      </YStack>
    );
  }

  // 권한 아직 없음
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

  const effectivePos: Pos | null =
    petPos && containerSize.width && containerSize.height
      ? petPos
      : containerSize.width && containerSize.height
      ? { x: containerSize.width / 2, y: containerSize.height * 0.6 }
      : null;

  // 스프라이트 PNG (domain/pet/assets.ts 에서 가져옴)
  const spriteSource = PET_SPRITE_ASSETS[spriteKey];

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      onLayout={handleLayout}
    >
      {/* 카메라 프리뷰 */}
      <CameraView style={styles.camera} facing={facing} />

      {/* 카메라 위에 펫 PNG 오버레이 */}
      {effectivePos && (
        <Image
          source={spriteSource}
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

      {/* 디버그/설명 오버레이 */}
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
