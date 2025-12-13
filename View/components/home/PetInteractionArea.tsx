import { Text } from "@/View/core/Text/Text";
import type { CurrentPetStatus } from "@/domain/pet/types";
import { router } from "expo-router";
import { Dimensions, Pressable } from "react-native";
import { Image, Spinner, XStack, YStack } from "tamagui";

/**
 * @typedef PetInteractionAreaProps
 * @property {CurrentPetStatus | null} petStatus - 현재 애완동물의 상태 정보입니다. 모델이나 이미지 표시에 사용됩니다.
 * @property {boolean} [isLoading] - 애완동물 상태 정보를 로딩 중인지 여부입니다.
 * @property {() => void} [onPetInteract] - 애완동물과 상호작용(터치 등)했을 때 호출될 함수입니다.
 */

type PetInteractionAreaProps = {
  petStatus: CurrentPetStatus | null;
  isLoading?: boolean;
  onPetInteract?: () => void;
};

/**
 * 애완동물 3D 모델 또는 2D 이미지가 표시되고, 간단한 상호작용(터치 등)이 가능한 영역입니다.
 * AR 화면으로 진입하는 버튼을 포함할 수 있습니다.
 *
 * @param {PetInteractionAreaProps} props - 컴포넌트 props
 * @returns {JSX.Element}
 */
export const PetInteractionArea = ({
  petStatus,
  isLoading,
  onPetInteract,
}: PetInteractionAreaProps) => {
  if (isLoading) {
    return (
      <YStack f={1} jc="center" ai="center" mih={250} gap="$md">
        <Spinner size="large" color="$accent1" />
        <Text type="body" colorVariant="secondary">
          애완동물 정보 로딩 중...
        </Text>
      </YStack>
    );
  }

  if (!petStatus) {
    return (
      <YStack f={1} jc="center" ai="center" mih={250} gap="$md">
        <Text type="h3">🐾</Text>
        <Text type="body" colorVariant="secondary" ta="center">
          애완동물을 먼저 선택해주세요.
        </Text>
        {/* TODO: 애완동물 선택 화면으로 이동하는 버튼 추가 고려 */}
      </YStack>
    );
  }

  // 현재 화면 너비에 따라 이미지 크기 동적 조절
  const imageWidth = Dimensions.get("window").width * 0.85;
  const imageHeight = imageWidth * 0.85; // 예시 비율 (정사각형에 가깝게)

  const petDisplay = petStatus.imageUrl ? (
    <Pressable onPress={onPetInteract} disabled={!onPetInteract}>
      <Image
        source={{ uri: petStatus.imageUrl }}
        width={imageWidth}
        height={imageHeight + 40}
        objectFit="cover" // 이미지가 잘리지 않고 비율 유지
        bg={"$background3"}
        br="$lg" // borderRadius
        // bg="$background2" // 이미지 로딩 중 배경색
        // TODO: 이미지 로딩 실패 시 fallback UI 추가 고려
      />
    </Pressable>
  ) : (
    <XStack
      w={imageWidth}
      h={imageHeight}
      bg="$background3"
      jc="center"
      ai="center"
      br="$lg"
      p="$md"
      onPress={onPetInteract} // 이름 표시 영역도 터치 가능하게
    >
      <Text type="h2" colorVariant="secondary">
        {petStatus.name}
      </Text>
    </XStack>
  );

  return (
    <YStack f={1} jc="space-around" ai="center" aspectRatio={1}>
      <YStack ai="center" gap="$sm">
        {petDisplay}
        <Text type="h3" fontWeight="$semibold" mt={"$sm"}>
          {petStatus.name}
        </Text>
      </YStack>

      {/* <Button
        variant="primary" // 주요 액션 버튼 스타일
        size="lg"
        onPress={handleGoToAR}
        icon={<Camera size="$1.5" color="$color1" />}
        w="80%" // 버튼 너비 조정
        mt={"$sm"}
      >
        AR 카메라로 보기
      </Button> */}
    </YStack>
  );
};

PetInteractionArea.displayName = "PetInteractionArea";
