// 유저
export type User = {
  user_id: number;
  email: string;
  nickname: string;
  coins: number;
  auth_provider: string;
  created_at: string;
};

// 펫
export type PetMaster = {
  pet_master_id: number;
  name: string;
  description: string;
  evolution_info?: Record<string, any>;
};

export type UserPet = {
  user_pet_id: number;
  user_id: number;
  pet_master_id: number;
  nickname: string;
  level: number;
  experience_points: number;
  is_active: boolean;
  created_at: string;
};

// 미션
export type MissionPreview = {
  user_mission_id: number;
  mission_master_id: number;
  title: string;
  mission_type: "daily" | "weekly";
  goal_type: string;
  goal_value: number;
  reward_xp: number;
  reward_coins: number;
  progress: number;
  is_completed: boolean;
  assigned_date: string;
};

// 컬렉션
export type UserCollection = {
  user_collection_id: number;
  pet_master_id: number;
  ascended_nickname: string;
  ascended_at: string;
};

export type MissionTimelineEvent = {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  details?: Record<string, any>;
};
