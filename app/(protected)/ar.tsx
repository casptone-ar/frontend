import { useRouter } from "expo-router";
import { YStack } from "tamagui";
import { DrivingCarController } from "@/View/components/ar/DrivingCarController";
import { ViroMaterials } from "@reactvision/react-viro";

export default function ARScreen() {
  const router = useRouter();
  const handleExit = () => {
    router.back();
  };
  return (
    <YStack f={1} position="relative">
      <DrivingCarController onExit={handleExit} />
    </YStack>
  );
}
