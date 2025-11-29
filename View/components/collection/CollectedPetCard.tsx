import type { CollectedPet } from "@/domain/collection/types";
import { Award, CalendarDays } from "@tamagui/lucide-icons"; // 아이콘 예시
import { Card, H4, Image, Paragraph, XStack, YStack } from "tamagui";

type CollectedPetCardProps = {
  pet: CollectedPet;
  onPress: () => void;
};

/**
 * 컬렉션 그리드에 표시될 개별 애완동물 카드 컴포넌트입니다.
 * 애완동물의 썸네일 이미지, 이름, 승천일 등을 간략하게 보여줍니다.
 *
 * @param {CollectedPetCardProps} props - 컴포넌트 props
 * @returns {JSX.Element}
 */
export const CollectedPetCard = ({ pet, onPress }: CollectedPetCardProps) => {
  const ascendedDate = new Date(pet.ascendedAt).toLocaleDateString();

  return (
    <Card elevate bordered onPress={onPress} pressStyle={{ scale: 0.97 }}>
      <Card.Header p="$2.5">
        {pet.thumbnailUrl ? (
          <Image
            source={{ uri: pet.thumbnailUrl, height: 120 }} // 실제 이미지 경로 및 크기 조정
            // TODO: 로컬 에셋인 경우 require 사용
            // aspectRatio={1} // 정사각형 유지
            style={{ width: "100%", height: 120 }} // 카드 너비에 맞춤
            br="$3" // borderRadius
          />
        ) : (
          <YStack height={120} bg="$color4" br="$3" jc="center" ai="center">
            <Award size="$4" color="$color10" />
          </YStack>
        )}
      </Card.Header>
      <YStack p="$2.5" pt="$1.5" space="$1">
        <H4 numberOfLines={1} ellipsizeMode="tail">
          {pet.name}
        </H4>
        <XStack ai="center" space="$1.5">
          <CalendarDays size={14} color="$color10" />
          <Paragraph size="$2" color="$color10">
            승천: {ascendedDate}
          </Paragraph>
        </XStack>
        <XStack ai="center" space="$1.5">
          <Award size={14} color="$color10" />
          <Paragraph size="$2" color="$color10">
            Lv.{pet.finalLevel}
          </Paragraph>
        </XStack>
      </YStack>
    </Card>
  );
};
