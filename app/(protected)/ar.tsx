import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CheckCircle2,
  Circle,
  CircleCheck,
  FileCheck2,
  Image as ImageIcon,
  UploadCloud,
  Video,
  Wifi,
  X,
} from "@tamagui/lucide-icons";
import { Button as TamaguiButton, Spinner, XStack, YStack } from "tamagui";

import { DrivingCarController } from "@/View/components/ar/DrivingCarController";
import { Button } from "@/View/core/Button/Button";
import { Card } from "@/View/core/Card/Card";
import { ScreenContainer } from "@/View/core/ScreenContainer/ScreenContainer";
import { Text } from "@/View/core/Text/Text";

type ArStep = "consent" | "session" | "processing" | "success";

type ProcessingStage = {
  key: string;
  title: string;
  durationMs: number;
};

const PROCESSING_STAGES: ProcessingStage[] = [
  { key: "collect_video", title: "영상 데이터 수집중", durationMs: 900 },
  { key: "compress_video", title: "영상 데이터 압축 중", durationMs: 1100 },
  { key: "send_images", title: "이미지 데이터 전송중", durationMs: 1000 },
  {
    key: "send_video_chunks",
    title: "영상 데이터 청크 전송 중",
    durationMs: 1200,
  },
  { key: "validate", title: "데이터 유효성 검증 중", durationMs: 900 },
  { key: "done", title: "서버로 데이터 전송 완료", durationMs: 700 },
];

type ConsentCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
};

const ConsentCard = ({
  icon,
  title,
  description,
  checked,
  onToggle,
}: ConsentCardProps) => {
  return (
    <Card
      bg="$background2"
      borderCurve="continuous"
      br="$xxl"
      // bw={1}
      boc="$color4"
      shop={0}
      p="$lg"
      gap="$sm"
      onPress={onToggle}
      pressStyle={{ opacity: 0.9 }}
    >
      <XStack jc="space-between" ai="flex-start" gap="$md">
        <XStack ai="center" gap="$sm" flex={1}>
          <YStack
            width={40}
            height={40}
            borderRadius="$circular"
            bg="$background3"
            ai="center"
            jc="center"
          >
            {icon}
          </YStack>
          <YStack flex={1} gap="$xxs">
            <Text type="h4" fontWeight="$semibold">
              {title}
            </Text>
            <Text type="caption" colorVariant="secondary">
              {description}
            </Text>
          </YStack>
        </XStack>

        {checked ? (
          <CheckCircle2 size={22} color="$accent1" />
        ) : (
          <Circle size={22} color="$text3" />
        )}
      </XStack>
    </Card>
  );
};

export default function ARScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<ArStep>("consent");

  const [videoConsent, setVideoConsent] = useState(false);
  const [imageConsent, setImageConsent] = useState(false);
  const canStart = videoConsent && imageConsent;

  // session HUD state (mock)
  const [socketConnected, setSocketConnected] = useState(false);
  const [videoChunkSent, setVideoChunkSent] = useState(0);
  const videoChunkTotal = 12;
  const [imageQueue, setImageQueue] = useState(2);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // processing state
  const [processingIndex, setProcessingIndex] = useState(0);

  const resetSessionMock = () => {
    setSocketConnected(false);
    setVideoChunkSent(0);
    setImageQueue(2);
    // setStep("consent");
    // setVideoConsent(false);
    // setImageConsent(false);
  };

  const cleanupSessionTimers = () => {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    if (socketTimerRef.current) {
      clearTimeout(socketTimerRef.current);
      socketTimerRef.current = null;
    }
  };

  // start session mock timers
  useEffect(() => {
    if (step !== "session") return;

    resetSessionMock();

    socketTimerRef.current = setTimeout(() => {
      setSocketConnected(true);
    }, 650);

    sessionTimerRef.current = setInterval(() => {
      setVideoChunkSent((prev) => {
        if (prev >= videoChunkTotal) return prev;
        const next = prev + 1;
        // 중간중간 이미지 큐가 줄어든 것처럼 보이기
        if (next === 4) setImageQueue(1);
        if (next === 8) setImageQueue(0);
        return next;
      });
    }, 900);

    return () => cleanupSessionTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // processing sequence mock
  useEffect(() => {
    if (step !== "processing") return;

    let cancelled = false;
    cleanupSessionTimers();
    setProcessingIndex(0);

    (async () => {
      for (let i = 0; i < PROCESSING_STAGES.length; i += 1) {
        if (cancelled) return;
        setProcessingIndex(i);
        await new Promise((r) =>
          setTimeout(r, PROCESSING_STAGES[i].durationMs)
        );
      }
      if (!cancelled) setStep("success");
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleStartSession = () => {
    if (!canStart) return;
    setStep("session");
  };

  const handleExitSession = () => {
    setStep("processing");
  };

  const handleGoHome = () => {
    setSocketConnected(false);
    setVideoChunkSent(0);
    setImageQueue(2);
    setStep("consent");
    setVideoConsent(false);
    setImageConsent(false);
    router.replace("/(protected)/home");
  };

  const processingProgressText = useMemo(() => {
    const current = PROCESSING_STAGES[processingIndex]?.title ?? "처리 중...";
    return current;
  }, [processingIndex]);

  if (step === "consent") {
    return (
      <ScreenContainer scrollable={false} padded="horizontal">
        <YStack f={1} pt="$xl" pb="$lg" jc="space-between" gap="$lg" px={"$5"}>
          <YStack gap="$sm" mt={84}>
            <Text type="h2">데이터 수집 동의</Text>
            <Text type="bodySmall" colorVariant="secondary">
              AR 주행 중 촬영된 영상/이미지는 서버로 전송되며, 리워드 지급에
              사용됩니다. (Mock)
            </Text>
          </YStack>

          <YStack gap="$md">
            <ConsentCard
              icon={<Video size={20} color="$accent1" />}
              title="영상 데이터 수집·전송"
              description="주행 중 촬영된 영상(청크)을 업로드합니다."
              checked={videoConsent}
              onToggle={() => setVideoConsent((v) => !v)}
            />
            <ConsentCard
              icon={<ImageIcon size={20} color="$accent1" />}
              title="이미지 데이터 수집·전송"
              description="스냅샷/프레임 이미지를 업로드합니다."
              checked={imageConsent}
              onToggle={() => setImageConsent((v) => !v)}
            />
          </YStack>

          <YStack gap="$sm">
            <Text type="caption" colorVariant="tertiary">
              * 두 항목 모두 동의해야 AR 주행을 시작할 수 있어요.
            </Text>
            <Button
              fullWidth
              height={56}
              bw={0}
              borderRadius={"$lg"}
              borderCurve="continuous"
              variant="primary"
              disabled={!canStart}
              onPress={handleStartSession}
            >
              동의하고 시작하기
            </Button>
          </YStack>
        </YStack>
      </ScreenContainer>
    );
  }

  if (step === "session") {
    return (
      <ScreenContainer
        scrollable={false}
        safeAreaTop={false}
        safeAreaBottom={false}
      >
        <YStack f={1} position="relative">
          <DrivingCarController />

          {/* ✅ 종료(X) + HUD (AR 노드가 아닌 2D 오버레이) */}
          <YStack
            position="absolute"
            top={insets.top + 10}
            left={12}
            right={12}
            pointerEvents="box-none"
          >
            <XStack jc="space-between" ai="flex-start">
              <TamaguiButton
                chromeless
                circular
                size="$4"
                backgroundColor="$background3"
                pressStyle={{ backgroundColor: "$color4", opacity: 0.9 }}
                onPress={handleExitSession}
                icon={<X size={20} color="$text1" />}
              />

              <YStack gap="$xs" ai="flex-end">
                <Card
                  bg="$background2"
                  borderCurve="continuous"
                  br="$xl"
                  bw={1}
                  boc="$color4"
                  shop={0}
                  p="$sm"
                  opacity={0.9}
                >
                  <XStack ai="center" gap="$xs">
                    <Wifi size={14} color="$accent1" />
                    <Text type="caption" colorVariant="secondary">
                      소켓: {socketConnected ? "연결됨" : "연결 중..."}
                    </Text>
                  </XStack>
                </Card>

                <Card
                  bg="$background2"
                  borderCurve="continuous"
                  br="$xl"
                  bw={1}
                  boc="$color4"
                  shop={0}
                  p="$sm"
                  opacity={0.9}
                >
                  <Text type="caption" colorVariant="secondary">
                    영상 청크 전송: {Math.min(videoChunkSent, videoChunkTotal)}/
                    {videoChunkTotal}
                  </Text>
                </Card>
              </YStack>
            </XStack>
          </YStack>

          <YStack
            position="absolute"
            left={12}
            bottom={insets.bottom + 10}
            pointerEvents="none"
          >
            <Card
              bg="$background2"
              borderCurve="continuous"
              br="$xl"
              bw={1}
              boc="$color4"
              shop={0}
              p="$sm"
              opacity={0.9}
            >
              <Text type="caption" colorVariant="secondary">
                이미지 큐: {imageQueue}장 대기
              </Text>
            </Card>
          </YStack>
        </YStack>
      </ScreenContainer>
    );
  }

  if (step === "processing") {
    return (
      <ScreenContainer scrollable={false} padded="horizontal">
        <YStack f={1} pt="$xl" pb="$lg" gap="$lg" px={"$5"}>
          <YStack gap="$sm">
            <Text type="h2">데이터 처리 중</Text>
            <Text type="bodySmall" colorVariant="secondary">
              주행 기록을 정리하고 서버로 업로드하고 있어요.
            </Text>
          </YStack>

          <Card
            bg="$background2"
            borderCurve="continuous"
            br="$xxl"
            shop={0}
            p="$lg"
            gap="$md"
            mt={"$5"}
          >
            <XStack ai="center" gap="$sm">
              <Spinner color="$accent1" />
              <Text type="body" fontWeight="$semibold">
                {processingProgressText}
              </Text>
            </XStack>

            <YStack gap="$sm">
              {PROCESSING_STAGES.map((s, idx) => {
                const isDone = idx < processingIndex;
                const isActive = idx === processingIndex;

                return (
                  <XStack key={s.key} ai="center" gap="$sm">
                    {isDone ? (
                      <CheckCircle2 size={18} color="$accent1" />
                    ) : isActive ? (
                      <Spinner size="small" color="$accent1" />
                    ) : (
                      <Circle size={18} color="$text3" />
                    )}
                    <Text
                      type="bodySmall"
                      colorVariant={
                        isDone ? "secondary" : isActive ? "primary" : "tertiary"
                      }
                    >
                      {s.title}
                    </Text>
                  </XStack>
                );
              })}
            </YStack>
          </Card>
        </YStack>
      </ScreenContainer>
    );
  }

  // success
  return (
    <ScreenContainer scrollable={false} padded="horizontal">
      <YStack f={1} pt="$xl" pb="$lg" jc="space-between" gap="$lg" px="$lg">
        <YStack gap="$md">
          <YStack
            width={56}
            height={56}
            borderRadius="$circular"
            bg="$background3"
            ai="center"
            jc="center"
          >
            <CircleCheck size={26} color="$accent1" />
          </YStack>

          <YStack gap="$xs">
            <Text type="h2">전송 성공</Text>
            <Text type="bodySmall" colorVariant="secondary">
              서버로 데이터 전송이 완료되었습니다.
            </Text>
          </YStack>

          <Card
            bg="$background2"
            borderCurve="continuous"
            br="$lg"
            bw={1}
            boc="$color4"
            shop={0}
            p="$lg"
            gap="$sm"
            mt={"$8"}
          >
            <XStack ai="center" gap="$sm">
              <CircleCheck size={18} color="$accent1" />
              <Text type="body" fontWeight="$semibold">
                업로드 요약
              </Text>
            </XStack>
            <Text type="caption" colorVariant="secondary">
              영상 청크 {Math.min(videoChunkSent, videoChunkTotal)}/
              {videoChunkTotal} · 이미지
              {Math.max(0, 2 - imageQueue)}장
            </Text>
          </Card>
        </YStack>

        <Button
          fullWidth
          variant="primary"
          onPress={handleGoHome}
          height={56}
          bw={0}
          borderRadius={"$lg"}
          borderCurve="continuous"
        >
          홈으로 돌아가기
        </Button>
      </YStack>
    </ScreenContainer>
  );
}
