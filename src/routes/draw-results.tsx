import { createFileRoute } from "@tanstack/react-router"

import { LandingResultsPage } from "@/features/landing/results-page"

export const Route = createFileRoute("/draw-results")({
  component: LandingResultsPage,
})
