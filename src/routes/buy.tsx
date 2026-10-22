import { createFileRoute } from "@tanstack/react-router"

import { LandingBuyPage } from "@/features/landing/buy-page"

export const Route = createFileRoute("/buy")({
  component: LandingBuyPage,
})
