import type { CollectedPet } from "@/domain/collection/types";
import { Award, CalendarDays, Info } from "@tamagui/lucide-icons";
import { H2, Image, Paragraph, XStack, YStack } from "tamagui";

type PetDetailViewProps = {
  pet: CollectedPet;
};

/**
 * 컬렉션 상세 화면에서 승천한 애완동물의 상세 정보 (3D 모델 또는 이미지, 이름, 설명, 승천일, 최종 레벨 등)를
 * 시각적으로 표시하는 컴포넌트입니다.
 * 실제 3D 모델 렌더링은 ARView와 유사하게 외부 라이브러리 연동이 필요할 수 있습니다.
 *
 * @param {PetDetailViewProps} props - 컴포넌트 props
 * @returns {JSX.Element}
 */
export const PetDetailView = ({ pet }: PetDetailViewProps) => {
  const ascendedDate = new Date(pet.ascendedAt).toLocaleDateString();

  return (
    <YStack space="$3" ai="center">
      {/* TODO: 실제 3D 모델 뷰어 컴포넌트로 교체 (예: expo-gl + three.js) */}
      {pet.modelUrl ? (
        // <Actual3DViewer modelUrl={pet.modelUrl} style={{ height: 250, width: '100%' }} />
        <YStack
          height={250}
          width="100%"
          bg="$color3"
          jc="center"
          ai="center"
          br="$4"
        >
          <Paragraph color="$color10">
            (3D 모델 뷰어 영역: {pet.modelUrl})
          </Paragraph>
        </YStack>
      ) : pet.thumbnailUrl ? (
        <Image
          source={{ uri: pet.thumbnailUrl, height: 250 }}
          style={{ width: "100%", height: 250, borderRadius: 8 }}
          resizeMode="contain"
        />
      ) : (
        <YStack
          height={200}
          width="100%"
          bg="$color3"
          jc="center"
          ai="center"
          br="$4"
        >
          <Award size="$5" color="$color10" />
        </YStack>
      )}

      <H2 textAlign="center">{pet.name}</H2>

      <YStack
        space="$2"
        p="$2"
        bc="$background"
        br="$4"
        elevation="$1"
        width="100%"
      >
        <XStack ai="flex-start" space="$2">
          <Info size={18} color="$color11" mt="$0.5" />
          <Paragraph color="$color11" f={1}>
            {pet.description || "특별한 설명이 없습니다."}
          </Paragraph>
        </XStack>
        <XStack ai="center" space="$2">
          <CalendarDays size={18} color="$color11" />
          <Paragraph color="$color11">승천일: {ascendedDate}</Paragraph>
        </XStack>
        <XStack ai="center" space="$2">
          <Award size={18} color="$color11" />
          <Paragraph color="$color11">최종 레벨: Lv.{pet.finalLevel}</Paragraph>
        </XStack>
      </YStack>
    </YStack>
  );
};
