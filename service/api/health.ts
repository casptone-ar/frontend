// service/api/health.ts
import { API } from "@/service/lib/Http/adapter";

export async function postSteps(steps_count: number) {
  return API.post("/v1/me/steps", { steps_count });
}
