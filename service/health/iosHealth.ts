// service/health/iosHealth.ts
import AppleHealthKit, { HealthValue } from "react-native-health";

const PERMS = [AppleHealthKit.Constants.Permissions.Steps];

export function initHealthKit(): Promise<boolean> {
  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(
      { permissions: { read: PERMS, write: [] } },
      (err?: string) => {
        // <-- 패키지 시그니처에 맞춤
        if (err) {
          console.warn("HealthKit init error", err);
          resolve(false);
          return;
        }
        resolve(true);
      }
    );
  });
}

export async function getTodaySteps(): Promise<number> {
  const ok = await initHealthKit();
  if (!ok) return 0;

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  return new Promise<number>((resolve) => {
    AppleHealthKit.getDailyStepCountSamples(
      { startDate: start.toISOString(), endDate: now.toISOString() },
      (err: string, results: HealthValue[] = []) => {
        if (err) {
          console.warn("Failed to get step data", err);
          resolve(0);
          return;
        }
        const steps = results.reduce(
          (sum, r) => sum + (Number(r.value) || 0),
          0
        );
        resolve(steps);
      }
    );
  });
}
