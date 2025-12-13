// View/store/missionStore.ts
import { createStore, useStore } from "zustand";

import type { Mission, MissionFilter, MissionStatus } from "@/domain/mission/types";

export type MissionSpot = {
  id: string;
  title: string;
  subtitle?: string;
  latitude: number;
  longitude: number;
  missionIds: string[];
};

type MissionStoreState = {
  missions: Mission[];
  filter: MissionFilter;
  spots: MissionSpot[];
};

type MissionStoreActions = {
  setFilter: (filter: MissionFilter) => void;
  getMissionById: (id: string) => Mission | undefined;
  getSpotById: (spotId: string) => MissionSpot | undefined;
  getMissionsBySpotId: (spotId: string) => Mission[];
  startMission: (id: string) => void;
  incrementProgress: (id: string, amount?: number) => void;
  completeMission: (id: string) => void;
  reset: () => void;
};

export type MissionStore = MissionStoreState & MissionStoreActions;

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

export const HWAJEONG_STATION_COORD = {
  latitude: 37.634863,
  longitude: 126.832149,
};

const INITIAL_MISSIONS: Mission[] = [
  // --- Daily (3) ---
  {
    id: "daily_1",
    title: "화정역 스팟 AR 트랙 2분 주행",
    description:
      "화정역 주변 스팟에서 AR 차량을 띄우고 트랙을 2분 이상 주행해보세요.",
    type: "daily",
    status: "in-progress",
    rewards: [
      { type: "coin", amount: 120 },
      { type: "experience", amount: 40 },
    ],
    targetValue: 120,
    currentValue: 35,
    unit: "초",
    category: "주행",
    startDate: new Date(now).toISOString(),
    endDate: new Date(now + day).toISOString(),
  },
  {
    id: "daily_2",
    title: "주행 영상 10초 업로드",
    description: "AR 주행 중 촬영한 영상(10초)을 업로드해 리워드를 받으세요.",
    type: "daily",
    status: "pending",
    rewards: [
      { type: "coin", amount: 80 },
      { type: "experience", amount: 30 },
    ],
    targetValue: 10,
    currentValue: 0,
    unit: "초",
    category: "업로드",
    startDate: new Date(now).toISOString(),
    endDate: new Date(now + day).toISOString(),
  },
  {
    id: "daily_3",
    title: "스냅샷 3장 업로드",
    description:
      "AR 차량 주행 장면을 스냅샷으로 저장하고 사진 3장을 업로드해요.",
    type: "daily",
    status: "pending",
    rewards: [
      { type: "coin", amount: 60 },
      { type: "experience", amount: 20 },
    ],
    targetValue: 3,
    currentValue: 0,
    unit: "장",
    category: "업로드",
    startDate: new Date(now).toISOString(),
    endDate: new Date(now + day).toISOString(),
  },
  {
    id: "daily_4",
    title: "화정 중앙 공원 AR 코너링 90초",
    description:
      "화정 중앙 공원 스팟에서 AR 차량을 띄우고 코너링 코스를 90초 이상 주행해요.",
    type: "daily",
    status: "pending",
    rewards: [
      { type: "coin", amount: 90 },
      { type: "experience", amount: 30 },
    ],
    targetValue: 90,
    currentValue: 0,
    unit: "초",
    category: "주행",
    startDate: new Date(now).toISOString(),
    endDate: new Date(now + day).toISOString(),
  },
  {
    id: "daily_5",
    title: "고양 어린이 박물관 스냅샷 2장 업로드",
    description:
      "고양 어린이 박물관 포토 스팟에서 스냅샷 2장을 촬영/업로드해보세요.",
    type: "daily",
    status: "pending",
    rewards: [
      { type: "coin", amount: 70 },
      { type: "experience", amount: 25 },
    ],
    targetValue: 2,
    currentValue: 0,
    unit: "장",
    category: "업로드",
    startDate: new Date(now).toISOString(),
    endDate: new Date(now + day).toISOString(),
  },
  {
    id: "daily_6",
    title: "백양중학교 앞 안전주행 60초",
    description:
      "백양중학교 스팟에서 안전주행(급가속/급회전 없이)으로 60초 주행해요. (Mock)",
    type: "daily",
    status: "pending",
    rewards: [
      { type: "coin", amount: 60 },
      { type: "experience", amount: 20 },
    ],
    targetValue: 60,
    currentValue: 0,
    unit: "초",
    category: "주행",
    startDate: new Date(now).toISOString(),
    endDate: new Date(now + day).toISOString(),
  },

  // --- Weekly (3) ---
  {
    id: "weekly_1",
    title: "화정역 주변 스팟 3곳 탐험",
    description: "지도에서 마커 스팟 3곳을 방문(가정)하고 미션을 수집해요.",
    type: "weekly",
    status: "in-progress",
    rewards: [
      { type: "coin", amount: 250 },
      { type: "experience", amount: 120 },
    ],
    targetValue: 3,
    currentValue: 1,
    unit: "회",
    category: "탐험",
    startDate: new Date(now).toISOString(),
    endDate: new Date(now + 7 * day).toISOString(),
  },
  {
    id: "weekly_2",
    title: "주행 로그 5회 전송",
    description:
      "주행 중 수집된 로그(속도/조향/충돌 이벤트 등)를 5회 전송해보세요.",
    type: "weekly",
    status: "pending",
    rewards: [
      { type: "coin", amount: 180 },
      { type: "experience", amount: 80 },
    ],
    targetValue: 5,
    currentValue: 0,
    unit: "회",
    category: "전송",
    startDate: new Date(now).toISOString(),
    endDate: new Date(now + 7 * day).toISOString(),
  },
  {
    id: "weekly_3",
    title: "AR 주행 누적 1,000m 달성",
    description: "일주일 동안 AR 트랙을 누적 1,000m 이상 주행해보세요.",
    type: "weekly",
    status: "pending",
    rewards: [
      { type: "coin", amount: 320 },
      { type: "experience", amount: 140 },
    ],
    targetValue: 1000,
    currentValue: 0,
    unit: "m",
    category: "주행",
    startDate: new Date(now).toISOString(),
    endDate: new Date(now + 7 * day).toISOString(),
  },
  {
    id: "weekly_4",
    title: "어울림 누리 체육관 랩 2회 완주",
    description:
      "어울림 누리 체육관 스팟에서 AR 트랙을 2회 완주해보세요. (Mock)",
    type: "weekly",
    status: "in-progress",
    rewards: [
      { type: "coin", amount: 260 },
      { type: "experience", amount: 120 },
    ],
    targetValue: 2,
    currentValue: 1,
    unit: "회",
    category: "주행",
    startDate: new Date(now).toISOString(),
    endDate: new Date(now + 7 * day).toISOString(),
  },
  {
    id: "weekly_5",
    title: "별무리경기장 스프린트 400m",
    description:
      "별무리경기장 스팟에서 직선 스프린트 코스를 400m 주행해보세요. (Mock)",
    type: "weekly",
    status: "pending",
    rewards: [
      { type: "coin", amount: 280 },
      { type: "experience", amount: 130 },
    ],
    targetValue: 400,
    currentValue: 0,
    unit: "m",
    category: "주행",
    startDate: new Date(now).toISOString(),
    endDate: new Date(now + 7 * day).toISOString(),
  },
  {
    id: "weekly_6",
    title: "대장천 주행 로그 3회 전송",
    description:
      "대장천 스팟에서 주행 로그(이벤트/센서)를 3회 전송해보세요. (Mock)",
    type: "weekly",
    status: "pending",
    rewards: [
      { type: "coin", amount: 200 },
      { type: "experience", amount: 90 },
    ],
    targetValue: 3,
    currentValue: 0,
    unit: "회",
    category: "전송",
    startDate: new Date(now).toISOString(),
    endDate: new Date(now + 7 * day).toISOString(),
  },

  // --- Completed (3) ---
  {
    id: "completed_1",
    title: "첫 AR 차량 소환",
    description: "처음으로 AR 차량을 화면에 띄웠어요.",
    type: "daily",
    status: "completed",
    rewards: [
      { type: "coin", amount: 30 },
      { type: "experience", amount: 20 },
    ],
    category: "튜토리얼",
    startDate: new Date(now - day).toISOString(),
    endDate: new Date(now).toISOString(),
  },
  {
    id: "completed_2",
    title: "첫 미디어 업로드 완료",
    description: "주행 중 촬영한 이미지/영상을 처음으로 업로드했어요.",
    type: "weekly",
    status: "completed",
    rewards: [
      { type: "coin", amount: 90 },
      { type: "experience", amount: 60 },
    ],
    category: "업로드",
    startDate: new Date(now - 7 * day).toISOString(),
    endDate: new Date(now - 3 * day).toISOString(),
  },
  {
    id: "completed_3",
    title: "화정역 스팟 도착",
    description: "화정역 주변 첫 스팟을 발견했어요. (가정)",
    type: "weekly",
    status: "completed",
    rewards: [
      { type: "coin", amount: 50 },
      { type: "experience", amount: 30 },
    ],
    category: "탐험",
    startDate: new Date(now - 7 * day).toISOString(),
    endDate: new Date(now - 2 * day).toISOString(),
  },
];

const INITIAL_SPOTS: MissionSpot[] = [
  {
    id: "spot_hwajeong_station",
    title: "화정역 (중심 스팟)",
    subtitle: "AR 차량 소환 · 주행 · 업로드 미션",
    latitude: HWAJEONG_STATION_COORD.latitude,
    longitude: HWAJEONG_STATION_COORD.longitude,
    missionIds: ["daily_1", "daily_2", "daily_3"],
  },
  {
    id: "spot_hwajeong_central_park",
    title: "화정 중앙 공원",
    subtitle: "코너링 주행 · 스냅샷 업로드",
    latitude: 37.631427,
    longitude: 126.832024,
    missionIds: ["daily_4", "daily_3", "weekly_1"],
  },
  {
    id: "spot_hwajeong_lotte_mart",
    title: "화정역 롯데마트",
    subtitle: "주행 영상 업로드 · 누적 거리",
    latitude: 37.632926,
    longitude: 126.831163,
    missionIds: ["daily_2", "weekly_3"],
  },
  {
    id: "spot_goyang_children_museum",
    title: "고양 어린이 박물관",
    subtitle: "포토 스팟 스냅샷 업로드",
    latitude: 37.629477,
    longitude: 126.831139,
    missionIds: ["daily_5", "daily_3"],
  },
  {
    id: "spot_eoullim_nuri_gym",
    title: "어울림 누리 체육관",
    subtitle: "랩 완주 챌린지",
    latitude: 37.64898,
    longitude: 126.833662,
    missionIds: ["weekly_4", "weekly_3"],
  },
  {
    id: "spot_byeolmuri_stadium",
    title: "별무리경기장",
    subtitle: "스프린트 주행",
    latitude: 37.649591,
    longitude: 126.832523,
    missionIds: ["weekly_5", "weekly_4"],
  },
  {
    id: "spot_daejangcheon",
    title: "대장천",
    subtitle: "주행 로그 전송",
    latitude: 37.64475,
    longitude: 126.82533,
    missionIds: ["weekly_6", "weekly_2"],
  },
  {
    id: "spot_baekyang_middle_school",
    title: "백양중학교",
    subtitle: "안전주행 미션",
    latitude: 37.630871,
    longitude: 126.83594,
    missionIds: ["daily_6", "weekly_1"],
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const resolveNextStatus = ({
  prevStatus,
  nextCurrentValue,
  targetValue,
}: {
  prevStatus: MissionStatus;
  nextCurrentValue: number;
  targetValue?: number;
}): MissionStatus => {
  if (prevStatus === "failed") return "failed";
  if (targetValue !== undefined && nextCurrentValue >= targetValue) return "completed";
  if (prevStatus === "completed") return "completed";
  if (nextCurrentValue > 0) return "in-progress";
  return "pending";
};

export const missionStore = createStore<MissionStore>((set, get) => ({
  missions: INITIAL_MISSIONS,
  filter: "all",
  spots: INITIAL_SPOTS,

  setFilter(filter) {
    set({ filter });
  },

  getMissionById(id) {
    return get().missions.find((m) => m.id === id);
  },

  getSpotById(spotId) {
    return get().spots.find((s) => s.id === spotId);
  },

  getMissionsBySpotId(spotId) {
    const spot = get().spots.find((s) => s.id === spotId);
    if (!spot) return [];
    const missions = get().missions;
    return spot.missionIds
      .map((id) => missions.find((m) => m.id === id))
      .filter(Boolean) as Mission[];
  },

  startMission(id) {
    set((state) => ({
      ...state,
      missions: state.missions.map((m) => {
        if (m.id !== id) return m;
        if (m.status === "completed" || m.status === "failed") return m;
        return {
          ...m,
          status: "in-progress",
          currentValue: m.currentValue ?? 0,
        };
      }),
    }));
  },

  incrementProgress(id, amount = 1) {
    if (!Number.isFinite(amount) || amount <= 0) return;

    set((state) => ({
      ...state,
      missions: state.missions.map((m) => {
        if (m.id !== id) return m;
        if (m.status === "failed") return m;

        const prev = m.currentValue ?? 0;
        const rawNext = prev + amount;
        const next =
          m.targetValue !== undefined ? clamp(rawNext, 0, m.targetValue) : rawNext;

        const nextStatus = resolveNextStatus({
          prevStatus: m.status,
          nextCurrentValue: next,
          targetValue: m.targetValue,
        });

        return {
          ...m,
          currentValue: next,
          status: nextStatus,
        };
      }),
    }));
  },

  completeMission(id) {
    set((state) => ({
      ...state,
      missions: state.missions.map((m) => {
        if (m.id !== id) return m;
        if (m.status === "failed") return m;
        const hasTarget = m.targetValue !== undefined;
        const target = m.targetValue ?? 1;
        return {
          ...m,
          status: "completed",
          currentValue: hasTarget ? target : (m.currentValue ?? 1),
          targetValue: m.targetValue,
        };
      }),
    }));
  },

  reset() {
    set({
      missions: INITIAL_MISSIONS,
      filter: "all",
      spots: INITIAL_SPOTS,
    });
  },
}));

export const useMissionStore = () => useStore(missionStore);
