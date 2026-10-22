import { createFileRoute } from "@tanstack/react-router"

import { LandingCheckPage } from "@/features/landing/check-page"

export const Route = createFileRoute("/check")({
  component: LandingCheckPage,
})
