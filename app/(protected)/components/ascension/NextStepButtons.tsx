import { Home, PawPrint } from "@tamagui/lucide-icons"; // 아이콘 예시
import { Button, Paragraph, YStack } from "tamagui";

type NextStepButtonsProps = {
  onGoHome: () => void;
  onSelectNewPet: () => void;
};

/**
 * 애완동물 승천 완료 화면에서 사용자에게 다음 행동을 선택할 수 있는
 * 버튼들을 제공하는 컴포넌트입니다. (예: 홈으로 가기, 새 애완동물 선택하기)
 *
 * @param {NextStepButtonsProps} props - 컴포넌트 props
 * @returns {JSX.Element}
 */
export const NextStepButtons = ({
  onGoHome,
  onSelectNewPet,
}: NextStepButtonsProps) => {
  return (
    <YStack space="$3" width="100%" ai="center">
      <Paragraph ta="center" color="$color11">
        이제 무엇을 하시겠습니까?
      </Paragraph>
      <Button
        icon={Home}
        onPress={onGoHome}
        size="$4"
        theme="base"
        width="80%"
        maw={300} // 최대 너비
      >
        홈으로 돌아가기
      </Button>
      <Button
        icon={PawPrint}
        onPress={onSelectNewPet}
        size="$4"
        width="80%"
        maw={300}
      >
        새로운 애완동물 선택하기
      </Button>
    </YStack>
  );
};
