import { customerApi } from "@/features/customer/api"
import type { UserProfile } from "@/lib/types"

export function needsOnboarding(profile: Pick<UserProfile, "firstName" | "lastName">) {
  return !profile.firstName?.trim() || !profile.lastName?.trim()
}

export async function resolvePostAuthPath() {
  const profile = await customerApi.profile()
  return needsOnboarding(profile) ? ("/onboarding" as const) : ("/home" as const)
}
