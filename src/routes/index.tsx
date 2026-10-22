import { createFileRoute } from "@tanstack/react-router"

import { LandingHomePage } from "@/features/landing/home-page"

export const Route = createFileRoute("/")({
  component: LandingHomePage,
})
