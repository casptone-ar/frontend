import type { PetAscensionResult } from "@/domain/pet/types";
import { Award, Coins, Gift } from "@tamagui/lucide-icons"; // 아이콘 예시
import { Card, H3, Paragraph, XStack, YStack } from "tamagui";

type AscensionSummaryProps = {
  result: PetAscensionResult;
};

/**
 * 애완동물 승천 완료 화면에서 승천 결과(획득한 보상 등)를
 * 요약하여 보여주는 컴포넌트입니다.
 *
 * @param {AscensionSummaryProps} props - 컴포넌트 props
 * @returns {JSX.Element}
 */
export const AscensionSummary = ({ result }: AscensionSummaryProps) => {
  return (
    <Card elevate bordered width="100%" p="$3">
      <Card.Header>
        <H3 ta="center">승천 보상</H3>
      </Card.Header>
      <YStack space="$2" pt="$2">
        <XStack ai="center" space="$3">
          <Award size={24} color="$gold10" />
          <Paragraph fontSize="$4" flex={1}>
            승천한 펫:{" "}
            <Paragraph fontWeight="bold" fontSize="$4">
              {result.ascendedPetName}
            </Paragraph>
          </Paragraph>
        </XStack>
        <XStack ai="center" space="$3">
          <Coins size={24} color="$yellow10" />
          <Paragraph fontSize="$4">
            보너스 코인:{" "}
            <Paragraph fontWeight="bold" fontSize="$4">
              +{result.bonusCoinsAwarded.toLocaleString()} 코인
            </Paragraph>
          </Paragraph>
        </XStack>
        {/* 향후 다른 보상이 있다면 여기에 추가 */}
        <XStack ai="center" space="$3">
          <Gift size={24} color="$purple10" />
          <Paragraph fontSize="$4">
            {result.ascendedPetName}의 기록이 동물농장에 추가되었습니다!
          </Paragraph>
        </XStack>
      </YStack>
    </Card>
  );
};
